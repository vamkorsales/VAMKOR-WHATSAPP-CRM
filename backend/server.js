const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase = null;
let useMockData = false;

// In-memory mock data for preview
let mockCustomers = [
  { id: '1', name: 'John Doe', phone: '+1234567890', email: 'john@example.com', created_at: new Date().toISOString() },
  { id: '2', name: 'Jane Smith', phone: '+0987654321', email: 'jane@example.com', created_at: new Date().toISOString() }
];
let mockMessages = [
  { id: '1', customer_id: '1', message: 'Hello, I have a question about my order.', direction: 'in', created_at: new Date().toISOString() },
  { id: '2', customer_id: '1', message: 'Sure, how can I help?', direction: 'out', created_at: new Date().toISOString() }
];
let mockTemplates = [
  { id: '1', name: 'Welcome Message', content: 'Hi {{name}}, welcome to our service!', category: 'MARKETING', status: 'APPROVED' },
  { id: '2', name: 'Order Update', content: 'Your order #{{order_id}} has been shipped.', category: 'UTILITY', status: 'APPROVED' }
];
let mockIntegration = {
  phoneNumberId: '1234567890',
  whatsappBusinessAccountId: '0987654321',
  accessToken: 'EAAbcdef...',
  webhookVerified: true
};

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Missing Supabase configuration. Falling back to in-memory mock database for preview.');
  useMockData = true;
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

app.get('/api/customers', async (req, res) => {
  if (useMockData) {
    return res.json([...mockCustomers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  }
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/customers', async (req, res) => {
  const { name, phone, email } = req.body;
  if (useMockData) {
    const newCustomer = { id: Date.now().toString(), name, phone, email, created_at: new Date().toISOString() };
    mockCustomers.push(newCustomer);
    return res.json(newCustomer);
  }
  const { data, error } = await supabase.from('customers').insert([{ name, phone, email }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.get('/api/messages/:customerId', async (req, res) => {
  const customerId = req.params.customerId;
  if (useMockData) {
    const customerMessages = mockMessages.filter(m => m.customer_id === customerId);
    return res.json(customerMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
  }
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/messages', async (req, res) => {
  const { customerId, message, direction } = req.body;
  if (useMockData) {
    const newMessage = { id: Date.now().toString(), customer_id: customerId, message, direction, created_at: new Date().toISOString() };
    mockMessages.push(newMessage);
    return res.json(newMessage);
  }
  const { data, error } = await supabase.from('messages').insert([
    {
      customer_id: customerId,
      message,
      direction
    }
  ]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});
app.get('/api/templates', async (req, res) => {
  if (useMockData) {
    return res.json(mockTemplates);
  }
  // In a real scenario, fetch from Supabase
  res.json([]);
});

app.post('/api/templates', async (req, res) => {
  const { name, content, category } = req.body;
  if (useMockData) {
    const newTemplate = { id: Date.now().toString(), name, content, category, status: 'PENDING' };
    mockTemplates.push(newTemplate);
    return res.json(newTemplate);
  }
  res.status(501).json({ error: 'Not implemented for Supabase yet' });
});

app.get('/api/integration', async (req, res) => {
  if (useMockData) {
    return res.json(mockIntegration);
  }
  res.json({});
});

app.post('/api/integration', async (req, res) => {
  const { phoneNumberId, whatsappBusinessAccountId, accessToken } = req.body;
  if (useMockData) {
    mockIntegration = { ...mockIntegration, phoneNumberId, whatsappBusinessAccountId, accessToken };
    return res.json(mockIntegration);
  }
  res.status(501).json({ error: 'Not implemented for Supabase yet' });
});

app.post('/api/contacts/import', async (req, res) => {
  const { contacts } = req.body; // Expects an array of {name, phone, email}
  if (!Array.isArray(contacts)) return res.status(400).json({ error: 'Invalid data format' });
  
  if (useMockData) {
    const newCustomers = contacts.map(c => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      created_at: new Date().toISOString()
    }));
    mockCustomers = [...mockCustomers, ...newCustomers];
    return res.json({ success: true, count: newCustomers.length });
  }
  
  // Real implementation for Supabase
  const { data, error } = await supabase.from('customers').insert(contacts).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, count: data.length });
});
app.post('/api/whatsapp/webhook', (req, res) => {
  console.log('Incoming message:', req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
