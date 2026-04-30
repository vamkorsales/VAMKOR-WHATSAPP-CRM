import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Billing() {
  const { token, user } = useAuth();
  const [billingData, setBillingData] = useState({ subscription: {}, history: [] });

  useEffect(() => {
    fetchBillingData();
  }, []);

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

  const handleUpgrade = async (plan) => {
    try {
      await axios.post(`${API_URL}/api/billing/upgrade`, { plan }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBillingData();
      alert(`Successfully upgraded to ${plan} plan!`);
    } catch (error) {
      alert("Upgrade failed.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Billing & Subscriptions</Typography>
      <Typography color="text.secondary" mb={4}>Manage your payment methods and subscription plans.</Typography>

      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: billingData.subscription.plan === 'Free' ? '2px solid #10B981' : 'none' }}>
            <CardContent>
              <Typography variant="h6">Free Tier</Typography>
              <Typography variant="h3" fontWeight="bold" my={2}>$0<Typography component="span" color="text.secondary">/mo</Typography></Typography>
              <Typography color="text.secondary" mb={3}>Basic WhatsApp outreach for starters.</Typography>
              <Button fullWidth variant={billingData.subscription.plan === 'Free' ? 'outlined' : 'contained'} onClick={() => handleUpgrade('Free')} disabled={billingData.subscription.plan === 'Free'}>
                {billingData.subscription.plan === 'Free' ? 'Current Plan' : 'Downgrade'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: billingData.subscription.plan === 'Pro' ? '2px solid #10B981' : 'none' }}>
            <CardContent>
              <Typography variant="h6">Pro Plan</Typography>
              <Typography variant="h3" fontWeight="bold" my={2}>$49<Typography component="span" color="text.secondary">/mo</Typography></Typography>
              <Typography color="text.secondary" mb={3}>Advanced analytics and team management.</Typography>
              <Button fullWidth variant={billingData.subscription.plan === 'Pro' ? 'outlined' : 'contained'} color="primary" onClick={() => handleUpgrade('Pro')} disabled={billingData.subscription.plan === 'Pro'}>
                {billingData.subscription.plan === 'Pro' ? 'Current Plan' : 'Upgrade to Pro'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: billingData.subscription.plan === 'Enterprise' ? '2px solid #10B981' : 'none' }}>
            <CardContent>
              <Typography variant="h6">Enterprise</Typography>
              <Typography variant="h3" fontWeight="bold" my={2}>$199<Typography component="span" color="text.secondary">/mo</Typography></Typography>
              <Typography color="text.secondary" mb={3}>Unlimited agents and dedicated support.</Typography>
              <Button fullWidth variant={billingData.subscription.plan === 'Enterprise' ? 'outlined' : 'contained'} color="primary" onClick={() => handleUpgrade('Enterprise')} disabled={billingData.subscription.plan === 'Enterprise'}>
                {billingData.subscription.plan === 'Enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="bold" gutterBottom>Payment History</Typography>
      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billingData.history.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">No payment history found.</TableCell></TableRow>
              ) : (
                billingData.history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>${row.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={row.status} color={row.status === 'succeeded' ? 'success' : 'warning'} size="small" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Billing;
