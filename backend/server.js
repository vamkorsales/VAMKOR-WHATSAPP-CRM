const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { db, initDb } = require('./database');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

// Global API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// Strict Login Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later' }
});

// Audit Logging Middleware
const logAudit = (agency_id, user_email, action, resource, ip_address, status) => {
  const id = Date.now().toString();
  db.run("INSERT INTO audit_logs (id, agency_id, user_email, action, resource, ip_address, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, agency_id || 'System', user_email || 'Unknown', action, resource, ip_address, status],
    (err) => { if (err) console.error("Audit log error:", err.message); }
  );
};

// Initialize SQLite Database
initDb();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

// Custom JWT Middleware
const checkJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ==========================================
// AUTH ROUTES
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  const { email, password, contactNumber, username, companyName, country } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password, and username are required' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    db.run(
      `INSERT INTO users (id, email, password_hash, contact_number, username, company_name, country, role, agency_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'ADMIN', ?)`,
      [id, email, passwordHash, contactNumber, username, companyName, country, id],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Email or username already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        const token = jwt.sign({ id, email, username, role: 'ADMIN', agency_id: id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, user: { id, email, username, companyName, role: 'ADMIN', agency_id: id } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin creating an Agent
app.post('/api/auth/agents', checkJwt, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Only admins can create agents' });

  const { email, password, username, contactNumber, role, assigned_campaigns, assigned_countries, status } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const agency_id = req.user.agency_id;

    db.run(
      `INSERT INTO users (id, email, password_hash, contact_number, username, role, assigned_campaigns, assigned_countries, status, agency_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, email, passwordHash, contactNumber, username, role || 'AGENT', JSON.stringify(assigned_campaigns || []), JSON.stringify(assigned_countries || []), status || 'Active', agency_id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ success: true, message: 'Agent created successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all agents for an agency
app.get('/api/auth/agents', checkJwt, (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Unauthorized' });
  db.all("SELECT id, email, username, contact_number, role, assigned_campaigns, assigned_countries, status, created_at FROM users WHERE agency_id = ? AND role != 'ADMIN' AND role != 'SUPER_ADMIN'", [req.user.agency_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({
      ...r,
      assigned_campaigns: JSON.parse(r.assigned_campaigns || '[]'),
      assigned_countries: JSON.parse(r.assigned_countries || '[]')
    })));
  });
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { email, password, twoFactorToken } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) {
      logAudit(null, email, 'LOGIN', 'Authentication', req.ip, 'FAILED_USER_NOT_FOUND');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      logAudit(user.agency_id, email, 'LOGIN', 'Authentication', req.ip, 'FAILED_PASSWORD');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // IP Whitelist Check (Admin only)
    if (user.role === 'ADMIN' && user.whitelisted_ips) {
      const allowedIps = JSON.parse(user.whitelisted_ips);
      if (allowedIps.length > 0 && !allowedIps.includes(req.ip)) {
        logAudit(user.agency_id, email, 'LOGIN', 'Authentication', req.ip, 'FAILED_IP_NOT_WHITELISTED');
        return res.status(403).json({ error: 'Access from this IP is restricted' });
      }
    }

    // 2FA Check
    if (user.two_factor_enabled) {
      if (!twoFactorToken) {
        return res.status(206).json({ requires2FA: true, message: 'Please provide 2FA token' });
      }
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: twoFactorToken
      });
      if (!verified) {
        logAudit(user.agency_id, email, 'LOGIN', 'Authentication', req.ip, 'FAILED_2FA');
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }
    }

    logAudit(user.agency_id, email, 'LOGIN', 'Authentication', req.ip, 'SUCCESS');

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      role: user.role, 
      agency_id: user.agency_id 
    }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, companyName: user.company_name, role: user.role, agency_id: user.agency_id } });
  });
});

// Setup 2FA
app.post('/api/auth/2fa/setup', checkJwt, (req, res) => {
  const secret = speakeasy.generateSecret({ name: `VamkorCRM (${req.user.email})` });
  QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if (err) return res.status(500).json({ error: 'Failed to generate QR Code' });
    
    db.run("UPDATE users SET two_factor_secret = ? WHERE id = ?", [secret.base32, req.user.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      logAudit(req.user.agency_id, req.user.email, 'SETUP_2FA', 'Security', req.ip, 'SUCCESS');
      res.json({ secret: secret.base32, qrCode: data_url });
    });
  });
});

app.post('/api/auth/2fa/verify', checkJwt, (req, res) => {
  const { token } = req.body;
  db.get("SELECT two_factor_secret FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) return res.status(500).json({ error: 'Failed to retrieve secret' });
    
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token
    });

    if (verified) {
      db.run("UPDATE users SET two_factor_enabled = 1 WHERE id = ?", [req.user.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logAudit(req.user.agency_id, req.user.email, 'ENABLE_2FA', 'Security', req.ip, 'SUCCESS');
        res.json({ success: true });
      });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  });
});

// ==========================================
// API ROUTES
// ==========================================

// --- Customers (Leads) ---
app.get('/api/customers', checkJwt, (req, res) => {
  db.all("SELECT * FROM customers WHERE agency_id = ? ORDER BY created_at DESC", [req.user.agency_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/customers', checkJwt, (req, res) => {
  const { name, phone, email, countryCode, dialCode, source, tag, campaign } = req.body;
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  db.run(
    `INSERT INTO customers (id, agency_id, name, phone, email, countryCode, dialCode, source, tag, campaign) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.user.agency_id, name, phone, email, countryCode, dialCode, source, tag, campaign],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, phone, email, countryCode, dialCode, source, tag, campaign });
    }
  );
});

// Import multiple customers
app.post('/api/contacts/import', checkJwt, (req, res) => {
  const { contacts } = req.body;
  if (!Array.isArray(contacts)) return res.status(400).json({ error: 'Invalid data format' });

  const stmt = db.prepare(
    `INSERT INTO customers (id, agency_id, name, phone, email, countryCode, dialCode, source, tag, campaign) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let count = 0;
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    contacts.forEach(c => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      stmt.run([id, req.user.agency_id, c.name, c.phone, c.email, c.countryCode, c.dialCode, c.source, c.tag, c.campaign]);
      count++;
    });
    db.run("COMMIT", (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, count });
    });
  });
  stmt.finalize();
});

// --- Messages ---
app.get('/api/messages/:customerId', checkJwt, (req, res) => {
  db.all(
    "SELECT * FROM messages WHERE customer_id = ? AND agency_id = ? ORDER BY created_at ASC", 
    [req.params.customerId, req.user.agency_id], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/api/messages', checkJwt, (req, res) => {
  const { customerId, message, direction } = req.body;
  const id = Date.now().toString();
  
  db.run(
    "INSERT INTO messages (id, agency_id, customer_id, message, direction) VALUES (?, ?, ?, ?, ?)",
    [id, req.user.agency_id, customerId, message, direction],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, customerId, message, direction });
    }
  );
});

// --- Templates ---
app.get('/api/templates', checkJwt, (req, res) => {
  db.all("SELECT * FROM templates WHERE agency_id = ? ORDER BY created_at DESC", [req.user.agency_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/templates', checkJwt, (req, res) => {
  const { name, content, category } = req.body;
  const id = Date.now().toString();
  const status = 'PENDING';
  
  db.run(
    "INSERT INTO templates (id, agency_id, name, content, category, status) VALUES (?, ?, ?, ?, ?, ?)",
    [id, req.user.agency_id, name, content, category, status],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, content, category, status });
    }
  );
});

// --- Integration Settings ---
app.get('/api/integration', checkJwt, (req, res) => {
  db.all("SELECT * FROM settings WHERE agency_id = ?", [req.user.agency_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const settingsObj = {};
    rows.forEach(r => settingsObj[r.key] = r.value);
    res.json(settingsObj);
  });
});

app.post('/api/integration', checkJwt, (req, res) => {
  const { phoneNumberId, whatsappBusinessAccountId, accessToken } = req.body;
  const settings = [
    { key: 'phoneNumberId', value: phoneNumberId },
    { key: 'whatsappBusinessAccountId', value: whatsappBusinessAccountId },
    { key: 'accessToken', value: accessToken },
    { key: 'webhookVerified', value: 'true' }
  ];

  const stmt = db.prepare("INSERT OR REPLACE INTO settings (agency_id, key, value) VALUES (?, ?, ?)");
  
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    settings.forEach(s => stmt.run([req.user.agency_id, s.key, s.value]));
    db.run("COMMIT", (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
  stmt.finalize();
});

// --- Billing / Subscriptions ---
app.get('/api/billing', checkJwt, (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Unauthorized' });
  db.get("SELECT * FROM subscriptions WHERE agency_id = ?", [req.user.agency_id], (err, sub) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all("SELECT * FROM payments WHERE agency_id = ? ORDER BY created_at DESC", [req.user.agency_id], (err, payments) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ subscription: sub || { plan: 'Free', status: 'active' }, history: payments });
    });
  });
});

app.post('/api/billing/upgrade', checkJwt, (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });
  const { plan } = req.body;
  // Mocking payment and subscription update
  const paymentId = 'pay_' + Date.now().toString();
  const amount = plan === 'Pro' ? 49.00 : plan === 'Enterprise' ? 199.00 : 0;
  
  db.serialize(() => {
    db.run("INSERT OR REPLACE INTO subscriptions (agency_id, plan, status, next_billing_date) VALUES (?, ?, 'active', datetime('now', '+1 month'))", [req.user.agency_id, plan]);
    if (amount > 0) {
      db.run("INSERT INTO payments (id, agency_id, amount, status) VALUES (?, ?, ?, 'succeeded')", [paymentId, req.user.agency_id, amount]);
    }
    res.json({ success: true, plan });
  });
});

// --- Public Webhook ---
app.post('/api/whatsapp/webhook', (req, res) => {
  console.log('Incoming message via webhook:', req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend Server running on port ${PORT} with Multi-Tenant RBAC JWT Protection`));
