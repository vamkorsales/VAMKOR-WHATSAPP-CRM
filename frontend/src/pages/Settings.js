import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Settings() {
  const { user, token } = useAuth();
  const [billingData, setBillingData] = useState({ subscription: { plan: 'Loading...' } });
  const [open2FA, setOpen2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [token2FA, setToken2FA] = useState('');
  const [whitelistIPs, setWhitelistIPs] = useState('');

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/billing`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBillingData(response.data);
      } catch (error) {
        console.error("Failed to fetch billing data", error);
      }
    };
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      fetchBillingData();
    }
  }, [token, user]);

  const handleSetup2FA = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/2fa/setup`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setQrCode(res.data.qrCode);
      setOpen2FA(true);
    } catch (error) {
      alert("Failed to setup 2FA");
    }
  };

  const handleVerify2FA = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/2fa/verify`, { token: token2FA }, { headers: { Authorization: `Bearer ${token}` } });
      alert("2FA Enabled Successfully!");
      setOpen2FA(false);
    } catch (error) {
      alert("Invalid Code");
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">Account Settings</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 4 }} elevation={1}>
            <Typography variant="h6" gutterBottom>Login Details</Typography>
            <Divider sx={{ mb: 3 }} />
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField label="Username" defaultValue={user?.username} InputProps={{ readOnly: true }} />
              <TextField label="Email Address" defaultValue={user?.email} InputProps={{ readOnly: true }} />
              <TextField label="Role" defaultValue={user?.role} InputProps={{ readOnly: true }} />
              <TextField label="Company Name" defaultValue={user?.companyName} InputProps={{ readOnly: true }} />
              <Button variant="contained" disabled>Update Profile</Button>
            </Box>
          </Paper>
        </Grid>
        
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={1}>
              <Typography variant="h6" gutterBottom>Current Subscription</Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h2" color="primary" fontWeight="bold" gutterBottom>
                {billingData.subscription.plan}
              </Typography>
              <Typography color="text.secondary" mb={3}>
                You are currently on the {billingData.subscription.plan} plan. Manage your plan and payment methods in the Billing tab.
              </Typography>
              <Button variant="outlined" component="a" href="/dashboard/billing">Manage Billing</Button>
            </Paper>
          </Grid>
        )}
        
        {/* Security Settings */}
        <Grid item xs={12} md={12}>
          <Paper elevation={1} sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>High Security (Enterprise)</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Two-Factor Authentication (2FA)</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Secure your account using a TOTP authenticator app like Google Authenticator.</Typography>
                <Button variant="contained" color="secondary" onClick={handleSetup2FA}>Setup 2FA</Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>IP Whitelisting</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Restrict access to this admin account to specific IP addresses. Comma separated.</Typography>
                <TextField 
                  fullWidth 
                  placeholder="e.g. 192.168.1.1, 203.0.113.5" 
                  value={whitelistIPs}
                  onChange={(e) => setWhitelistIPs(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button variant="outlined">Save Whitelist</Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* 2FA Setup Dialog */}
      <Dialog open={open2FA} onClose={() => setOpen2FA(false)}>
        <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography>Scan this QR code with your Authenticator App:</Typography>
          {qrCode && <img src={qrCode} alt="2FA QR Code" width={200} height={200} />}
          <TextField 
            label="Enter 6-digit code" 
            fullWidth 
            value={token2FA}
            onChange={(e) => setToken2FA(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen2FA(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleVerify2FA}>Verify & Enable</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Settings;
