import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Grid, Button, Switch, Divider, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, TextField, MenuItem, FormControlLabel, Card, CardContent
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Billing() {
  const { token } = useAuth();
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [autoRenew, setAutoRenew] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [plan, setPlan] = useState('Free');

  useEffect(() => {
    if (token) fetchBilling();
  }, [token]);

  const fetchBilling = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/billing`, { headers: { Authorization: `Bearer ${token}` } });
      setWalletBalance(res.data.wallet_balance || 0);
      setPlan(res.data.plan || 'Free');
    } catch (err) {
      console.error('Failed to fetch billing info', err);
    }
  };

  const handleTopUp = async () => {
    const amountStr = window.prompt("Enter amount to add to your wallet ($):", "100");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

    try {
      const res = await axios.post(`${API_URL}/api/billing/topup`, { amount }, { headers: { Authorization: `Bearer ${token}` } });
      setWalletBalance(res.data.wallet_balance);
      alert(`Successfully added $${amount} to your wallet!`);
    } catch (err) {
      console.error('Failed to top up', err);
      alert('Failed to process payment.');
    }
  };

  const invoices = [
    { id: 'INV-2026-001', client: 'Vamkor HQ', plan: plan, amount: 1200, gst: 216, total: 1416, status: 'Paid', date: '2026-04-01' },
    { id: 'INV-2026-002', client: 'Vamkor HQ', plan: 'Usage Overage', amount: 150, gst: 27, total: 177, status: 'Pending', date: '2026-04-15' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="h4" fontWeight="bold">Advanced Billing & Subscriptions</Typography>

      {/* Credit Wallet & Usage Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>Credit Wallet</Typography>
                <AccountBalanceWalletIcon color="success" />
              </Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>${parseFloat(walletBalance).toFixed(2)}</Typography>
              <Button variant="contained" color="success" size="small" fullWidth onClick={handleTopUp}>
                ➕ Add Funds (Mock Stripe)
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Usage-Based Metrics (April 2026)</Typography>
            <Grid container spacing={4} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <Typography color="text.secondary">Utility Convos</Typography>
                <Typography variant="h5" fontWeight="bold">12,450</Typography>
                <Typography variant="caption" color="text.secondary">$0.005 / msg</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="text.secondary">Marketing Convos</Typography>
                <Typography variant="h5" fontWeight="bold">45,100</Typography>
                <Typography variant="caption" color="text.secondary">$0.015 / msg</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="text.secondary">Current Overage</Typography>
                <Typography variant="h5" fontWeight="bold" color="error">-$125.50</Typography>
                <Typography variant="caption" color="text.secondary">Will be billed EOM</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Subscription Management */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Subscription Management (Current: {plan})</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <TextField select label="Billing Model" value="Hybrid" fullWidth margin="normal">
              <MenuItem value="Subscription">Subscription Only</MenuItem>
              <MenuItem value="Pay-per-message">Pay-per-message (PAYG)</MenuItem>
              <MenuItem value="Hybrid">Hybrid (Subscription + Usage)</MenuItem>
            </TextField>
            <TextField select label="Billing Cycle" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} fullWidth margin="normal">
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Yearly">Yearly (Save 20%)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Payment Settings</Typography>
              <FormControlLabel 
                control={<Switch checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} color="primary" />} 
                label={<Typography fontWeight="bold">Auto-renewal enabled</Typography>} 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                Automatically charge the primary card on file when the billing cycle ends or wallet drops below $50.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField label="Coupon / Discount Code" size="small" />
                <Button variant="outlined">Apply</Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Invoices */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">Invoices & Statements</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" color="primary" onClick={handleTopUp}>Pay via Stripe</Button>
            <Button variant="outlined" size="small" color="secondary">Pay via Razorpay</Button>
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Invoice ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Client Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Plan / Item</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>GST (18%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{inv.id}</TableCell>
                  <TableCell>{inv.client}</TableCell>
                  <TableCell>{inv.plan}</TableCell>
                  <TableCell>${inv.amount.toFixed(2)}</TableCell>
                  <TableCell>${inv.gst.toFixed(2)}</TableCell>
                  <TableCell fontWeight="bold">${inv.total.toFixed(2)}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>
                    <Chip label={inv.status} color={inv.status === 'Paid' ? 'success' : 'warning'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Billing;
