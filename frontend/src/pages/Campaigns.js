import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Switch, Chip, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';

// Vibrant header gradient for "interesting colors"
const headerGradient = 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)';

function Campaigns() {
  const [campaigns, setCampaigns] = useState([
    { 
      id: 1, name: 'Black Friday Blast', type: 'Marketing', status: 'Active', 
      balanceLeft: 550, sent: 450, delivered: 440, opened: 300, replied: 85, failed: 10, 
      dataAdded: 1000, assignedAgent: 'Pratiksha', openTime: '2.5 hrs', language: 'English', approval: 'Approved', totalSpent: 125.50
    },
    { 
      id: 2, name: 'Welcome Series', type: 'Utility', status: 'Paused', 
      balanceLeft: 12000, sent: 1200, delivered: 1195, opened: 900, replied: 200, failed: 5, 
      dataAdded: 5000, assignedAgent: 'Auto-Bot', openTime: '1 hr', language: 'Multi-lingual', approval: 'Pending', totalSpent: 450.00
    },
    { 
      id: 3, name: 'EMI Notifications', type: 'Finance', status: 'Active', 
      balanceLeft: 4000, sent: 320, delivered: 320, opened: 310, replied: 15, failed: 0, 
      dataAdded: 320, assignedAgent: 'System', openTime: '30 mins', language: 'Hindi', approval: 'Approved', totalSpent: 85.20
    }
  ]);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Marketing', language: 'English', trigger: '' });

  const handleToggle = (id) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status: c.status === 'Active' ? 'Paused' : 'Active' } : c
    ));
  };

  const handleCreate = () => {
    setCampaigns([...campaigns, {
      id: Date.now(),
      ...formData,
      status: 'Paused', balanceLeft: 0, sent: 0, delivered: 0, opened: 0, replied: 0, failed: 0, dataAdded: 0, assignedAgent: 'Unassigned', openTime: '-', approval: 'Pending', totalSpent: 0
    }]);
    setOpen(false);
  };

  // Aggregate metrics
  const totalSent = campaigns.reduce((acc, c) => acc + c.sent, 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + c.opened, 0);
  const totalFailed = campaigns.reduce((acc, c) => acc + c.failed, 0);
  const aggregateSpent = campaigns.reduce((acc, c) => acc + c.totalSpent, 0);

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
                <TableCell sx={{ fontWeight: 'bold' }}>Toggle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Typography fontWeight="bold">{c.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Agent: {c.assignedAgent}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={c.type} size="small" sx={{ bgcolor: c.type === 'Finance' ? '#FEF3C7' : c.type === 'Marketing' ? '#DBEAFE' : '#E0E7FF' }} />
                  </TableCell>
                  <TableCell>{c.dataAdded}</TableCell>
                  <TableCell>{c.sent} / <Typography component="span" color="success.main">{c.delivered}</Typography></TableCell>
                  <TableCell>{c.opened} / <Typography component="span" color="primary">{c.replied}</Typography></TableCell>
                  <TableCell fontWeight="bold" color="#D97706">${c.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={c.approval} size="small" color={c.approval === 'Approved' ? 'success' : 'warning'} variant="outlined" />
                  </TableCell>
                  <TableCell>{c.language}</TableCell>
                  <TableCell>
                    <Chip label={c.status} color={c.status === 'Active' ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={c.status === 'Active'} onChange={() => handleToggle(c.id)} color="primary" />
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
          <Button variant="contained" onClick={handleCreate}>Draft Campaign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Campaigns;
