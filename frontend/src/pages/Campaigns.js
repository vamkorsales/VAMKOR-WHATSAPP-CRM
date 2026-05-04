import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Switch, Chip, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Vibrant header gradient for "interesting colors"
const headerGradient = 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)';

function Campaigns() {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Marketing', language: 'English', trigger: '' });

  useEffect(() => {
    if (token) fetchCampaigns();
  }, [token]);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/campaigns`, { headers: { Authorization: `Bearer ${token}` } });
      setCampaigns(res.data);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    // Optimistic UI update
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: newStatus } : c));
    try {
      await axios.put(`${API_URL}/api/campaigns/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Failed to toggle campaign', err);
      fetchCampaigns(); // Revert on failure
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/api/campaigns/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete campaign', err);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/campaigns`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setCampaigns([res.data, ...campaigns]);
      setOpen(false);
      setFormData({ name: '', type: 'Marketing', language: 'English', trigger: '' });
    } catch (err) {
      console.error('Failed to create campaign', err);
    }
  };

  // Aggregate metrics
  const totalSent = campaigns.reduce((acc, c) => acc + (c.sent || 0), 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + (c.opened || 0), 0);
  const totalFailed = campaigns.reduce((acc, c) => acc + (c.failed || 0), 0);
  const aggregateSpent = campaigns.reduce((acc, c) => acc + (c.budget_used || 0), 0);

  return (
    <Box>
      <Box sx={{ p: 4, mb: 4, borderRadius: 3, background: headerGradient, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" fontWeight="bold" gutterBottom>Campaign Intelligence</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>Monitor real-time metrics, dynamic triggers, and message delivery.</Typography>
        </Box>
        <Button variant="contained" color="secondary" size="large" onClick={() => setOpen(true)} sx={{ bgcolor: 'white', color: '#2563EB', '&:hover': { bgcolor: '#f8fafc' }}}>
          ➕ Create Campaign
        </Button>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={1} sx={{ borderLeft: '4px solid #10B981' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Sent</Typography>
              <Typography variant="h4" fontWeight="bold">{totalSent}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={1} sx={{ borderLeft: '4px solid #3B82F6' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Opened</Typography>
              <Typography variant="h4" fontWeight="bold">{totalOpened}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={1} sx={{ borderLeft: '4px solid #8B5CF6' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Avg Open Time</Typography>
              <Typography variant="h4" fontWeight="bold">1.5 hrs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={1} sx={{ borderLeft: '4px solid #EF4444' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Failed Messages</Typography>
              <Typography variant="h4" fontWeight="bold" color="error">{totalFailed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={1} sx={{ borderLeft: '4px solid #F59E0B' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Spent</Typography>
              <Typography variant="h4" fontWeight="bold" color="#D97706">${aggregateSpent.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="bold" gutterBottom color="#1E293B">Active Campaigns Matrix</Typography>
      
      <Paper elevation={1}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Campaign</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Data Size</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Sent / Delivered</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Opened / Replied</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total Spent</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Meta Approval</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Language</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No campaigns found. Click "Create Campaign" to get started.
                  </TableCell>
                </TableRow>
              ) : null}
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Typography fontWeight="bold">{c.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Agent: {c.assigned_agent}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={c.type} size="small" sx={{ bgcolor: c.type === 'Finance' ? '#FEF3C7' : c.type === 'Marketing' ? '#DBEAFE' : '#E0E7FF' }} />
                  </TableCell>
                  <TableCell>{c.data_added}</TableCell>
                  <TableCell>{c.sent} / <Typography component="span" color="success.main">{c.delivered}</Typography></TableCell>
                  <TableCell>{c.opened} / <Typography component="span" color="primary">{c.replied}</Typography></TableCell>
                  <TableCell fontWeight="bold" color="#D97706">${(c.budget_used || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={c.approval_status} size="small" color={c.approval_status === 'Approved' ? 'success' : 'warning'} variant="outlined" />
                  </TableCell>
                  <TableCell>{c.language}</TableCell>
                  <TableCell>
                    <Chip label={c.status} color={c.status === 'Active' ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                    <Switch checked={c.status === 'Active'} onChange={() => handleToggle(c.id, c.status)} color="primary" />
                    <IconButton color="error" size="small" onClick={() => handleDelete(c.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle variant="h5" fontWeight="bold">Create New Campaign</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField label="Campaign Name" fullWidth value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Campaign Type</InputLabel>
                <Select value={formData.type} label="Campaign Type" onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <MenuItem value="Utility">Utility (OTP, Alerts)</MenuItem>
                  <MenuItem value="Marketing">Marketing (Offers)</MenuItem>
                  <MenuItem value="Finance">Finance (EMI, Invoices)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Template Language 🌍</InputLabel>
                <Select value={formData.language} label="Template Language 🌍" onChange={(e) => setFormData({...formData, language: e.target.value})}>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Spanish">Spanish</MenuItem>
                  <MenuItem value="Hindi">Hindi</MenuItem>
                  <MenuItem value="Multi-lingual">Multi-lingual / Dynamic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Keyword Trigger (Lead Bot)" placeholder="e.g., 'INTERESTED', 'BUY NOW'" fullWidth value={formData.trigger} onChange={(e) => setFormData({...formData, trigger: e.target.value})} helperText="Attach an automated bot qualification flow when this keyword is received." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!formData.name}>Draft Campaign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Campaigns;
