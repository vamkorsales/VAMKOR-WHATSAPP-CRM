import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Divider } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Settings() {
  const { user, token } = useAuth();
  const [billingData, setBillingData] = useState({ subscription: { plan: 'Loading...' } });

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
      </Grid>
    </Box>
  );
}

export default Settings;
