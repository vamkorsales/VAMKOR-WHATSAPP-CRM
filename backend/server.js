const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { supabase } = require('./supabase');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const getOpenWaApiKey = () => {
  if (process.env.OPENWA_API_KEY) return process.env.OPENWA_API_KEY;
  try {
    const keyPath = path.join(__dirname, '../whatsapp-gateway/data/.api-key');
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8').trim();
    }
  } catch (e) {
    console.error('Could not read OpenWA API key file:', e.message);
  }
  return 'vamkor_openwa_secret';
};

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '5mb' })); // limit JSON payloads
app.set('trust proxy', 1);

// Global API Rate Limiter
const helmet = require('helmet');
app.use(helmet());
const morgan = require('morgan');
app.use(morgan('combined'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests from this IP' }
});
app.use('/api/', apiLimiter);

// Supabase JWT Middleware
const checkJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.error('[checkJwt] Token validation failed:', error?.message);
      return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    }

    // Try to fetch profile — but NEVER fail if it doesn't exist yet
    let agency_id = user.id;  // default: user's own ID is their agency
    let role = 'ADMIN';
    try {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('agency_id, role')
        .eq('id', user.id)
        .single();

      if (profile && !profileErr) {
        agency_id = profile.agency_id || user.id;
        role = profile.role || 'ADMIN';
      }
    } catch (profileFetchErr) {
      // Profile table may not exist or row missing — that's OK, use user.id as agency
      console.warn('[checkJwt] Could not load profile, using user.id as agency_id');
    }

    req.user = { id: user.id, email: user.email, agency_id, role };
    next();
  } catch (err) {
    console.error('[checkJwt] Unexpected error:', err.message);
    return res.status(401).json({ error: 'Auth error: ' + err.message });
  }
};

// ── Debug endpoint (remove in production) ──
app.get('/api/debug', async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').select('count').limit(1);
    if (error) return res.json({ ok: false, supabase_error: error.message });
    res.json({ ok: true, message: 'Supabase connection works', time: new Date().toISOString() });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ==========================================
// API ROUTES (Supabase Integrated)
// ==========================================

// --- Customers (Leads) ---
app.get('/api/customers', checkJwt, async (req, res) => {
  console.log('[GET /api/customers] agency_id =', req.user.agency_id);
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('agency_id', req.user.agency_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/customers] Supabase error:', error.message);
    return res.status(500).json({ error: error.message });
  }
  console.log('[GET /api/customers] Returned', data?.length || 0, 'records');
  res.json(data || []);
});

app.post('/api/customers', checkJwt, async (req, res) => {
  const { name, phone, email, countryCode, dialCode, source, tag, campaign } = req.body;
  // Validation
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }
  const safeName = String(name).trim().substring(0, 255);
  const safePhone = String(phone).trim().substring(0, 50);
  const safeEmail = email ? String(email).trim().substring(0, 255) : null;
  const safeSource = source ? String(source).trim().substring(0, 100) : null;
  const safeTag = tag ? String(tag).trim().substring(0, 50) : null;
  const safeCampaign = campaign ? String(campaign).trim().substring(0, 100) : null;

  const { data, error } = await supabase
    .from('customers')
    .insert([
      {
        agency_id: req.user.agency_id,
        name: safeName,
        phone: safePhone,
        email: safeEmail,
        country_code: countryCode,
        dial_code: dialCode,
        source: safeSource,
        tag: safeTag,
        campaign: safeCampaign,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('[POST /api/customers] Error:', error.message);
    return res.status(500).json({ error: 'Failed to add contact.' });
  }
  res.json(data);
});

// Import multiple customers
app.post('/api/contacts/import', checkJwt, async (req, res) => {
  const { contacts } = req.body;
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: 'contacts must be a non-empty array' });
  }

  const mappedContacts = contacts.map(c => ({
    agency_id: req.user.agency_id,
    name: (c.name || '').toString().trim(),
    phone: (c.phone || '').toString().trim(),
    email: (c.email || '').toString().trim() || null,
    country_code: c.countryCode || 'US',
    dial_code: c.dialCode || '+1',
    source: c.source || 'CSV Import',
    tag: c.tag || 'Cold',
    campaign: c.campaign || null
  })).filter(c => c.name && c.phone); // safety: skip rows with no name or phone

  if (mappedContacts.length === 0) {
    return res.status(400).json({ error: 'No valid contacts found in the import data.' });
  }

  console.log('[POST /api/contacts/import] Importing', mappedContacts.length, 'contacts for agency', req.user.agency_id);
  const { data, error } = await supabase.from('customers').insert(mappedContacts).select();

  if (error) {
    console.error('[POST /api/contacts/import] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true, count: data.length });
});

// --- Messages ---
app.get('/api/messages/:customerId', checkJwt, async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('customer_id', req.params.customerId)
    .eq('agency_id', req.user.agency_id)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/messages', checkJwt, async (req, res) => {
  const { customerId, message, direction, mediaUrl, mediaType } = req.body;
  
  if (direction === 'OUTBOUND') {
    // Fetch WhatsApp Credentials from Settings
    const { data: settings, error: setErr } = await supabase
      .from('settings')
      .select('key, value')
      .eq('agency_id', req.user.agency_id)
      .in('key', ['accessToken', 'phoneNumberId', 'whatsappConnectionType']);
      
    if (setErr || !settings) return res.status(500).json({ error: 'Failed to retrieve settings' });
    
    const config = settings.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    if (config.whatsappConnectionType === 'openwa') {
      const openwaUrl = process.env.OPENWA_URL || 'http://localhost:2785';
      const apiKey = getOpenWaApiKey();
      const sessionName = `agency_${req.user.agency_id}`;

      try {
        // Fetch session UUID
        const sessionsRes = await axios.get(`${openwaUrl}/api/sessions`, { headers: { 'X-API-Key': apiKey } });
        const session = sessionsRes.data.find(s => s.name === sessionName);
        if (!session) throw new Error('OpenWA session not initialized for this agency');

        const payload = {
          chatId: customer.phone.includes('@') ? customer.phone : `${customer.phone.replace(/[^0-9]/g, '')}@c.us`,
          text: mediaUrl ? `${message}\n\nMedia Link: ${mediaUrl}` : message
        };

        await axios.post(`${openwaUrl}/api/sessions/${session.id}/messages/send-text`, payload, {
          headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('OpenWA API Error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to send OpenWA message', details: error.response?.data });
      }
    } else {
      if (!config.accessToken || !config.phoneNumberId) {
         return res.status(400).json({ error: 'WhatsApp API credentials not configured' });
      }

      try {
        // Format payload for Meta API (Text or Media)
        let payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: customer.phone,
          type: mediaUrl ? mediaType : 'text',
        };

        if (mediaUrl) {
          payload[mediaType] = { link: mediaUrl };
          if (mediaType === 'document') {
            payload[mediaType].filename = message.replace('[Media] ', ''); // extract original filename
          }
        } else {
          payload.text = { preview_url: false, body: message };
        }

        // Send to Meta API
        await axios.post(
          `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`,
          payload,
          { headers: { 'Authorization': `Bearer ${config.accessToken}`, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Meta API Error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to send Meta WhatsApp message', details: error.response?.data });
      }
    }
      
      // Save to DB
      // Note: we can't save media_url directly since we didn't add it to supabase_schema.sql originally.
      // So we will just save the media link in the message body for now, or append it to the message.
      const finalMessageText = mediaUrl ? `${message}\n\nMedia Link: ${mediaUrl}` : message;

      const { data: msgData, error: msgErr } = await supabase
        .from('messages')
        .insert([{ agency_id: req.user.agency_id, customer_id: customerId, message: finalMessageText, direction }])
        .select().single();
        
      if (msgErr) return res.status(500).json({ error: msgErr.message });
      return res.json(msgData);

  } else {
    // Just save internal note or inbound
    const { data, error } = await supabase
      .from('messages')
      .insert([{ agency_id: req.user.agency_id, customer_id: customerId, message, direction }])
      .select().single();
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }
});

// --- Campaigns ---
app.get('/api/campaigns', checkJwt, async (req, res) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('agency_id', req.user.agency_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/campaigns', checkJwt, async (req, res) => {
  const { name, type, language, trigger } = req.body;
  const { data, error } = await supabase
    .from('campaigns')
    .insert([{
      agency_id: req.user.agency_id,
      name, type, language, assigned_agent: req.user.email,
      status: 'Paused', approval_status: 'Pending'
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/campaigns/:id', checkJwt, async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase
    .from('campaigns')
    .update({ status })
    .eq('id', req.params.id)
    .eq('agency_id', req.user.agency_id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/campaigns/:id', checkJwt, async (req, res) => {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', req.params.id)
    .eq('agency_id', req.user.agency_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- Billing ---
app.get('/api/billing', checkJwt, async (req, res) => {
  // Try to fetch subscription/wallet
  let { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('agency_id', req.user.agency_id)
    .single();

  // If none exists, create a default free tier
  if (!data) {
    const { data: newSub, error: insertErr } = await supabase
      .from('subscriptions')
      .insert([{ agency_id: req.user.agency_id, plan: 'Free', wallet_balance: 0.00 }])
      .select().single();
    
    if (insertErr) return res.status(500).json({ error: insertErr.message });
    data = newSub;
  }
  
  res.json(data);
});

app.post('/api/billing/topup', checkJwt, async (req, res) => {
  const { amount } = req.body;
  
  // First get current balance
  const { data: current } = await supabase
    .from('subscriptions')
    .select('wallet_balance')
    .eq('agency_id', req.user.agency_id)
    .single();
    
  const currentBalance = current?.wallet_balance || 0;
  const newBalance = parseFloat(currentBalance) + parseFloat(amount);

  // Update balance
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ wallet_balance: newBalance })
    .eq('agency_id', req.user.agency_id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  
  // Log payment
  await supabase.from('payments').insert([{
    agency_id: req.user.agency_id,
    amount: amount,
    status: 'Completed'
  }]);

  res.json(data);
});

// --- Integration Settings ---
app.get('/api/integration', checkJwt, async (req, res) => {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .eq('agency_id', req.user.agency_id);

  if (error) return res.status(500).json({ error: error.message });
  
  const settingsObj = data.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
  res.json(settingsObj);
});

app.post('/api/integration', checkJwt, async (req, res) => {
  const { phoneNumberId, whatsappBusinessAccountId, accessToken } = req.body;
  const settings = [
    { agency_id: req.user.agency_id, key: 'phoneNumberId', value: phoneNumberId },
    { agency_id: req.user.agency_id, key: 'whatsappBusinessAccountId', value: whatsappBusinessAccountId },
    { agency_id: req.user.agency_id, key: 'accessToken', value: accessToken },
    { agency_id: req.user.agency_id, key: 'webhookVerified', value: 'true' },
    { agency_id: req.user.agency_id, key: 'whatsappConnectionType', value: req.body.whatsappConnectionType || 'meta' }
  ];

  const { error } = await supabase.from('settings').upsert(settings);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- OpenWA Proxy Routes ---
app.post('/api/openwa/session/start', checkJwt, async (req, res) => {
  const sessionName = `agency_${req.user.agency_id}`;
  const apiKey = getOpenWaApiKey();
  const openwaUrl = process.env.OPENWA_URL || 'http://localhost:2785';

  try {
    let sessionId;
    const getRes = await axios.get(`${openwaUrl}/api/sessions`, { headers: { 'X-API-Key': apiKey } });
    const existing = getRes.data.find(s => s.name === sessionName);

    if (existing) {
      sessionId = existing.id;
    } else {
      const createRes = await axios.post(`${openwaUrl}/api/sessions`, { name: sessionName }, {
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' }
      });
      sessionId = createRes.data.id;
    }

    try {
      await axios.post(`${openwaUrl}/api/sessions/${sessionId}/start`, {}, {
        headers: { 'X-API-Key': apiKey }
      });
    } catch (e) {
      if (e.response && e.response.status === 400 && e.response.data?.message?.includes('already started')) {
        console.log('OpenWA session already running, proceeding to QR fetch');
      } else {
        throw e;
      }
    }

    // Add webhook pointing back to our own server
    const myWebhookUrl = `${process.env.BACKEND_URL || 'http://host.docker.internal:5001'}/api/openwa/webhook/${req.user.agency_id}`;
    try {
      await axios.post(`${openwaUrl}/api/sessions/${sessionId}/webhooks`, {
        url: myWebhookUrl,
        events: ['message.received'],
        secret: 'vamkor_openwa_webhook_secret'
      }, {
        headers: { 'X-API-Key': apiKey }
      });
    } catch (e) {
      console.warn('Could not set OpenWA webhook (maybe already exists)');
    }

    res.json({ success: true, sessionId });
  } catch (err) {
    console.error('OpenWA Start Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to start OpenWA session' });
  }
});

app.get('/api/openwa/session/qr', checkJwt, async (req, res) => {
  const sessionName = `agency_${req.user.agency_id}`;
  const apiKey = getOpenWaApiKey();
  const openwaUrl = process.env.OPENWA_URL || 'http://localhost:2785';

  try {
    const getRes = await axios.get(`${openwaUrl}/api/sessions`, { headers: { 'X-API-Key': apiKey } });
    const session = getRes.data.find(s => s.name === sessionName);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const response = await axios.get(`${openwaUrl}/api/sessions/${session.id}/qr`, {
      headers: { 'X-API-Key': apiKey }
    });
    res.json(response.data);
  } catch (err) {
    if (err.response && err.response.status === 400) {
       return res.status(400).json({ error: err.response.data.message || 'QR not ready or already connected' });
    }
    console.error('OpenWA QR Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
});

// OpenWA Incoming Webhook
app.post('/api/openwa/webhook/:agencyId', async (req, res) => {
  // Webhook signature validation can be added here
  const { agencyId } = req.params;
  const { event, payload } = req.body;

  if (event === 'message.received') {
    const fromPhone = payload.message?.from?.replace('@c.us', '');
    const msgBody = payload.message?.body || '[Media/Unsupported]';
    const contactName = payload.message?.notifyName || 'Unknown';

    if (!fromPhone || fromPhone.includes('@g.us')) return res.sendStatus(200); // Ignore groups

    let { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', fromPhone)
      .eq('agency_id', agencyId)
      .single();

    if (!customer) {
      const { data: newCust } = await supabase
        .from('customers')
        .insert([{ agency_id: agencyId, name: contactName, phone: fromPhone, source: 'WhatsApp Web', tag: 'New' }])
        .select('id').single();
      customer = newCust;
    }
    
    if (customer) {
      const msgId = payload.message?.id?.id || undefined;
      await supabase
        .from('messages')
        .insert([{ id: msgId, agency_id: agencyId, customer_id: customer.id, message: msgBody, direction: 'INBOUND' }]);
    }
  }

  res.sendStatus(200);
});

// --- Public Webhook ---
// Verification Request from Meta
app.get('/api/whatsapp/webhook', (req, res) => {
  const verify_token = process.env.META_VERIFY_TOKEN;
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

// Incoming Message Payload
app.post('/api/whatsapp/webhook', async (req, res) => {
  const body = req.body;

  if (body.object) {
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0] && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
      
      const val = body.entry[0].changes[0].value;
      let phoneNumberId = val.metadata.phone_number_id;
      let fromPhone = val.messages[0].from; 
      let msgBody = val.messages[0].text ? val.messages[0].text.body : '[Media/Unsupported Message]';
      let contactName = val.contacts && val.contacts[0] ? val.contacts[0].profile.name : 'Unknown';

      // Find which agency this phone number belongs to
      const { data: settingRow, error: setErr } = await supabase
        .from('settings')
        .select('agency_id')
        .eq('key', 'phoneNumberId')
        .eq('value', phoneNumberId)
        .single();

      if (setErr || !settingRow) {
        console.error('Webhook received for unknown phoneNumberId:', phoneNumberId);
        return res.sendStatus(200); 
      }

      const agency_id = settingRow.agency_id;

      // Check if customer exists, if not create one
      let { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', fromPhone)
        .eq('agency_id', agency_id)
        .single();

      if (!customer) {
        const { data: newCust } = await supabase
          .from('customers')
          .insert([{ agency_id, name: contactName, phone: fromPhone, source: 'WhatsApp Webhook', tag: 'New' }])
          .select('id').single();
        customer = newCust;
      }
      
      if (customer) {
        // Save the message
        const msgId = val.messages[0].id || undefined;
        await supabase
          .from('messages')
          .insert([{ id: msgId, agency_id, customer_id: customer.id, message: msgBody, direction: 'INBOUND' }]);
      }
    }
    return res.sendStatus(200);
  } else {
    return res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend Server running on port ${PORT} with Supabase Integration`));
