import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Button, Paper, TextField, Alert, AlertTitle
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Integration() {
  const [integration, setIntegration] = useState(null);
  const [formData, setFormData] = useState({
    phoneNumberId: '',
    whatsappBusinessAccountId: '',
    accessToken: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/integration`);
      if (res.data && res.data.phoneNumberId) {
        setIntegration(res.data);
        setFormData({
          phoneNumberId: res.data.phoneNumberId,
          whatsappBusinessAccountId: res.data.whatsappBusinessAccountId,
          accessToken: res.data.accessToken
        });
      }
    } catch (err) {
      console.error('Failed to fetch integration:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.post(`${API_URL}/api/integration`, formData);
      await fetchIntegration();
      alert('Integration settings saved successfully.');
    } catch (err) {
      console.error('Failed to save integration:', err);
    }
    setIsSaving(false);
  };

  return (
    <Box sx={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {integration && integration.webhookVerified ? (
        <Alert severity="success" sx={{ border: '1px solid', borderColor: 'success.light' }}>
          <AlertTitle>WhatsApp API Connected</AlertTitle>
          Your WhatsApp Business account is successfully integrated and webhook is verified.
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ border: '1px solid', borderColor: 'warning.light' }}>
          <AlertTitle>Integration Pending</AlertTitle>
          Please configure your Meta App credentials to start sending and receiving messages.
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Meta API Credentials</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Enter the details from your Meta Developer Portal.
        </Typography>
        
        <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField 
            label="Phone Number ID" 
            variant="outlined" 
            required
            fullWidth
            value={formData.phoneNumberId}
            onChange={(e) => setFormData({...formData, phoneNumberId: e.target.value})}
            placeholder="e.g. 1045938294829"
          />
          
          <TextField 
            label="WhatsApp Business Account ID" 
            variant="outlined" 
            required
            fullWidth
            value={formData.whatsappBusinessAccountId}
            onChange={(e) => setFormData({...formData, whatsappBusinessAccountId: e.target.value})}
            placeholder="e.g. 102938475620"
          />
          
          <TextField 
            label="Temporary or Permanent Access Token" 
            variant="outlined" 
            type="password"
            required
            fullWidth
            value={formData.accessToken}
            onChange={(e) => setFormData({...formData, accessToken: e.target.value})}
            placeholder="EAA..."
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>Webhook URL (Configure this in Meta)</Typography>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px dashed', borderColor: 'divider', fontFamily: 'monospace', color: 'text.secondary' }}>
              {API_URL}/api/whatsapp/webhook
            </Box>
          </Box>

          <Button type="submit" variant="contained" disabled={isSaving} sx={{ alignSelf: 'flex-start', mt: 2 }}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Integration;
