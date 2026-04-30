const express = require('express');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const { db, initDb } = require('./database');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
initDb();

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE || 'https://api.vamkor.com',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-vamkor.us.auth0.com/',
});

// Mock Auth0 setup instructions if env variables are missing
if (!process.env.AUTH0_ISSUER_BASE_URL) {
  console.warn("⚠️ AUTH0_ISSUER_BASE_URL is not set in .env.");
  console.warn("⚠️ The API is currently running WITH auth, but it will fail unless configured.");
}

// ==========================================
// API ROUTES
// ==========================================

// --- Customers (Leads) ---
app.get('/api/customers', checkJwt, (req, res) => {
  db.all("SELECT * FROM customers ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/customers', checkJwt, (req, res) => {
  const { name, phone, email, countryCode, dialCode, source, tag, campaign } = req.body;
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  db.run(
    `INSERT INTO customers (id, name, phone, email, countryCode, dialCode, source, tag, campaign) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, phone, email, countryCode, dialCode, source, tag, campaign],
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
    `INSERT INTO customers (id, name, phone, email, countryCode, dialCode, source, tag, campaign) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let count = 0;
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    contacts.forEach(c => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      stmt.run([id, c.name, c.phone, c.email, c.countryCode, c.dialCode, c.source, c.tag, c.campaign]);
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
    "SELECT * FROM messages WHERE customer_id = ? ORDER BY created_at ASC", 
    [req.params.customerId], 
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
    "INSERT INTO messages (id, customer_id, message, direction) VALUES (?, ?, ?, ?)",
    [id, customerId, message, direction],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, customerId, message, direction });
    }
  );
});

// --- Templates ---
app.get('/api/templates', checkJwt, (req, res) => {
  db.all("SELECT * FROM templates ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/templates', checkJwt, (req, res) => {
  const { name, content, category } = req.body;
  const id = Date.now().toString();
  const status = 'PENDING';
  
  db.run(
    "INSERT INTO templates (id, name, content, category, status) VALUES (?, ?, ?, ?, ?)",
    [id, name, content, category, status],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, content, category, status });
    }
  );
});

// --- Integration ---
app.get('/api/integration', checkJwt, (req, res) => {
  db.all("SELECT * FROM settings", [], (err, rows) => {
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

  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    settings.forEach(s => stmt.run([s.key, s.value]));
    db.run("COMMIT", (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
  stmt.finalize();
});

// --- Public Webhook ---
app.post('/api/whatsapp/webhook', (req, res) => {
  console.log('Incoming message via webhook:', req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend Server running on port ${PORT} with SQLite & Auth0 JWT Protection`));
