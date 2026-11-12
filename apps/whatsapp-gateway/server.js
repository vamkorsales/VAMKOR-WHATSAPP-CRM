const express = require('express');
const qrcode = require('qrcode');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 2785;
const API_KEY = process.env.OPENWA_API_KEY || 'vamkor_openwa_secret';
const MOCK_MODE = process.env.MOCK_MODE === 'true';

// Middleware to check API key
const checkApiKey = (req, res, next) => {
  const headerKey = req.headers['x-api-key'];
  if (!headerKey || headerKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Invalid X-API-Key header.' });
  }
  next();
};

app.use(checkApiKey);

// Active Sessions Store
const sessions = new Map();

// Helper to generate a mock QR code base64 URL
const generateMockQr = async (sessionName) => {
  return await qrcode.toDataURL(`https://vamkor.com/mock-connect?session=${sessionName}`);
};

// Endpoints

// 1. Get all sessions
app.get('/api/sessions', (req, res) => {
  const list = Array.from(sessions.values()).map(s => ({
    id: s.id,
    name: s.name,
    status: s.status
  }));
  res.json(list);
});

// 2. Create a new session session slot
app.post('/api/sessions', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Session name is required' });

  // Check if session already exists
  let existing = null;
  for (const s of sessions.values()) {
    if (s.name === name) {
      existing = s;
      break;
    }
  }

  if (existing) {
    return res.json({ id: existing.id, name: existing.name, status: existing.status });
  }

  const id = `sess_${Math.random().toString(36).substring(2, 11)}`;
  const newSession = {
    id,
    name,
    status: 'INITIALIZING',
    qrCode: null,
    webhookUrl: null,
    webhookSecret: null,
    client: null,
    isMock: MOCK_MODE
  };

  sessions.set(id, newSession);
  res.json({ id: newSession.id, name: newSession.name, status: newSession.status });
});

// 3. Start a session
app.post('/api/sessions/:id/start', async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (session.status === 'CONNECTED') {
    return res.status(400).json({ message: 'Session is already connected' });
  }

  res.json({ success: true, message: 'Session initialization triggered' });

  // Async initialization
  initSession(session);
});

// 4. Get session QR code
app.get('/api/sessions/:id/qr', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (session.status === 'CONNECTED') {
    return res.status(400).json({ message: 'WhatsApp is already connected' });
  }

  if (!session.qrCode) {
    return res.status(400).json({ message: 'QR Code not generated yet. Please wait.' });
  }

  res.json({ qrCode: session.qrCode });
});

// 5. Configure session Webhook
app.post('/api/sessions/:id/webhook', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { url, secret } = req.body;
  if (!url) return res.status(400).json({ error: 'Webhook url is required' });

  session.webhookUrl = url;
  session.webhookSecret = secret;

  console.log(`[Gateway] Webhook set for session ${session.name} -> ${url}`);
  res.json({ success: true });
});

// 6. Send text message
app.post('/api/sessions/:id/messages/send-text', async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (session.status !== 'CONNECTED') {
    return res.status(400).json({ error: 'WhatsApp session is not connected.' });
  }

  const { chatId, text } = req.body;
  if (!chatId || !text) return res.status(400).json({ error: 'chatId and text are required.' });

  try {
    if (session.isMock) {
      console.log(`[Gateway Mock] Outbound Message to ${chatId}: "${text}"`);
      
      // Simulate automatic mock incoming reply for demo purposes after 4 seconds
      setTimeout(async () => {
        if (session.webhookUrl) {
          try {
            console.log(`[Gateway Mock] Simulating auto-reply to ${chatId}`);
            await axios.post(session.webhookUrl, {
              event: 'message.received',
              payload: {
                message: {
                  id: `mock_inbound_${Date.now()}`,
                  from: chatId,
                  body: `Thanks for messaging! Received: "${text.substring(0, 30)}..."`,
                  notifyName: 'WhatsApp Client Sim'
                }
              }
            }, {
              headers: { 'X-Webhook-Secret': session.webhookSecret }
            });
          } catch (e) {
            console.error('[Gateway Mock Webhook Trigger Error]:', e.message);
          }
        }
      }, 4000);

      return res.json({ success: true, messageId: `mock_msg_${Date.now()}` });
    } else {
      // Real wa-automate outbound send
      if (!session.client) throw new Error('WhatsApp client instance missing');
      const response = await session.client.sendText(chatId, text);
      return res.json({ success: true, messageId: response });
    }
  } catch (err) {
    console.error(`[Gateway] Error sending message:`, err.message);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

// Initialize session logic (Mock vs Real with Auto Fallback)
async function initSession(session) {
  if (session.isMock) {
    console.log(`[Gateway] Launching session ${session.name} in Sandbox (Mock) Mode`);
    session.status = 'QR';
    session.qrCode = await generateMockQr(session.name);
    
    // Simulate connection after 8 seconds
    setTimeout(() => {
      session.status = 'CONNECTED';
      session.qrCode = null;
      console.log(`[Gateway Mock] Session ${session.name} connected successfully.`);
      
      // Send a mock inbound webhook message 5 seconds after connection
      setTimeout(async () => {
        if (session.webhookUrl) {
          try {
            console.log(`[Gateway Mock] Triggering first mock inbound webhook to ${session.webhookUrl}`);
            await axios.post(session.webhookUrl, {
              event: 'message.received',
              payload: {
                message: {
                  id: `mock_inbound_${Date.now()}`,
                  from: '1234567890@c.us',
                  body: 'Hey! I saw your CRM connection QR and wanted to say hi! 👋',
                  notifyName: 'Jane Doe (WhatsApp Demo)'
                }
              }
            }, {
              headers: { 'X-Webhook-Secret': session.webhookSecret }
            });
          } catch (err) {
            console.error('[Gateway Mock Webhook Error]:', err.message);
          }
        }
      }, 5000);

    }, 8000);
  } else {
    // Real wa-automate client initialization
    console.log(`[Gateway] Attempting to launch real WhatsApp automation for ${session.name}`);
    try {
      const { create } = require('@open-wa/wa-automate');
      
      session.status = 'INITIALIZING';
      
      const client = await create({
        sessionId: session.name,
        qrTimeout: 0,
        authTimeout: 0,
        headless: true,
        multiDevice: true,
        useChrome: false, // Use bundled chromium
        qrLogSkip: true,
        eventMode: true,
        killProcessOnBrowserClose: true
      });

      session.client = client;
      session.status = 'CONNECTED';
      session.qrCode = null;
      console.log(`[Gateway] WhatsApp connected for session: ${session.name}`);

      // Handle QR changes
      client.onStateChanged((state) => {
        console.log(`[Gateway State Change]: ${state}`);
        if (state === 'UNPAIRED' || state === 'CONFLICT') {
          session.status = 'QR';
        }
      });

      // Handle incoming messages
      client.onMessage(async (message) => {
        if (session.webhookUrl) {
          try {
            await axios.post(session.webhookUrl, {
              event: 'message.received',
              payload: { message }
            }, {
              headers: { 'X-Webhook-Secret': session.webhookSecret }
            });
          } catch (webHookErr) {
            console.error(`[Gateway Webhook Error] Failed to post webhook:`, webHookErr.message);
          }
        }
      });

    } catch (err) {
      console.warn(`[Gateway Real Launch Failed]:`, err.message);
      console.warn(`[Gateway Fallback] Missing system dependencies/browser capabilities. Switching to Sandbox (Mock) Mode for session ${session.name}.`);
      
      // Auto-fallback to mock mode
      session.isMock = true;
      initSession(session);
    }
  }
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`WhatsApp Gateway Service running on port ${PORT}`);
  console.log(`API Key: ${API_KEY}`);
  console.log(`Mock Mode: ${MOCK_MODE} (Real client auto-falls back to sandbox if launch fails)`);
  console.log(`=======================================================`);
});
