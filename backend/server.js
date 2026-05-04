const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { supabase } = require('./supabase');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

// Global API Rate Limiter
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
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Fetch profile to get agency_id and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id, role')
      .eq('id', user.id)
      .single();

    req.user = { 
      id: user.id, 
      email: user.email, 
      agency_id: profile?.agency_id || user.id, // Fallback if no profile
      role: profile?.role || 'ADMIN' 
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Internal auth error' });
  }
};

// ==========================================
// API ROUTES (Supabase Integrated)
// ==========================================

// --- Customers (Leads) ---
app.get('/api/customers', checkJwt, async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('agency_id', req.user.agency_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/customers', checkJwt, async (req, res) => {
  const { name, phone, email, countryCode, dialCode, source, tag, campaign } = req.body;
  
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      agency_id: req.user.agency_id,
      name, phone, email, country_code: countryCode, dial_code: dialCode, source, tag, campaign
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Import multiple customers
app.post('/api/contacts/import', checkJwt, async (req, res) => {
  const { contacts } = req.body;
  if (!Array.isArray(contacts)) return res.status(400).json({ error: 'Invalid data format' });

  const mappedContacts = contacts.map(c => ({
    agency_id: req.user.agency_id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    country_code: c.countryCode,
    dial_code: c.dialCode,
    source: c.source,
    tag: c.tag,
    campaign: c.campaign
  }));

  const { data, error } = await supabase.from('customers').insert(mappedContacts);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, count: mappedContacts.length });
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
  const { customerId, message, direction } = req.body;
  
  if (direction === 'OUTBOUND') {
    // Fetch WhatsApp Credentials from Settings
    const { data: settings, error: setErr } = await supabase
      .from('settings')
      .select('key, value')
      .eq('agency_id', req.user.agency_id)
      .in('key', ['accessToken', 'phoneNumberId']);
      
    if (setErr || !settings) return res.status(500).json({ error: 'Failed to retrieve settings' });
    
    const config = settings.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    if (!config.accessToken || !config.phoneNumberId) {
       return res.status(400).json({ error: 'WhatsApp API credentials not configured' });
    }

    // Fetch Customer Phone
    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .select('phone')
      .eq('id', customerId)
      .eq('agency_id', req.user.agency_id)
      .single();

    if (custErr || !customer) return res.status(404).json({ error: 'Customer not found' });

    try {
      // Send to Meta API
      await axios.post(
        `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: customer.phone,
          type: 'text',
          text: { preview_url: false, body: message }
        },
        { headers: { 'Authorization': `Bearer ${config.accessToken}`, 'Content-Type': 'application/json' } }
      );
      
      // Save to DB
      const { data: msgData, error: msgErr } = await supabase
        .from('messages')
        .insert([{ agency_id: req.user.agency_id, customer_id: customerId, message, direction }])
        .select().single();
        
      if (msgErr) return res.status(500).json({ error: msgErr.message });
      return res.json(msgData);

    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Failed to send WhatsApp message', details: error.response?.data });
    }
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
    { agency_id: req.user.agency_id, key: 'webhookVerified', value: 'true' }
  ];

  const { error } = await supabase.from('settings').upsert(settings);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// --- Public Webhook ---
// Verification Request from Meta
app.get('/api/whatsapp/webhook', (req, res) => {
  const verify_token = process.env.META_VERIFY_TOKEN || 'vamkor_crm_secure_token';
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
