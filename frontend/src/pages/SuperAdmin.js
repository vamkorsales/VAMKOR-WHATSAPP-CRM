import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, Divider, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

function SuperAdmin() {
  const [openPlan, setOpenPlan] = useState(false);
  const [planData, setPlanData] = useState({
    type: 'Growth', name: '', monthlyPrice: '', yearlyPrice: '', msgLimit: '', contactLimit: '', campaignLimit: '', waNumberLimit: ''
  });

  const agencies = [
    { id: 1, name: 'Vamkor HQ', owner: 'Pratiksha', plan: 'Enterprise', mrr: '$1200', users: 15, status: 'Active' },
    { id: 2, name: 'Marketing Pros LLC', owner: 'John Doe', plan: 'Pro', mrr: '$450', users: 5, status: 'Active' },
    { id: 3, name: 'Local Retailer', owner: 'Jane Smith', plan: 'Free', mrr: '$0', users: 2, status: 'Inactive' }
  ];

  const totalMRR = agencies.reduce((acc, a) => acc + parseInt(a.mrr.replace('$', '')), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Super Admin Command Center</Typography>
          <Typography color="text.secondary">Global overview of all agencies, system health, and plan management.</Typography>
        </Box>
        <Button variant="contained" color="secondary" onClick={() => setOpenPlan(true)}>➕ Create Plan</Button>
      </Box>

      {/* Global Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card elevation={1}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Agencies</Typography>
              <Typography variant="h3" fontWeight="bold">{agencies.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={1}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Users (Agents)</Typography>
              <Typography variant="h3" fontWeight="bold">22</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={1} sx={{ bgcolor: '#0F172A', color: 'white' }}>
            <CardContent>
              <Typography sx={{ opacity: 0.8 }} gutterBottom>Global MRR</Typography>
              <Typography variant="h3" fontWeight="bold" color="#10B981">${totalMRR}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Server & Global Controls */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <MemoryIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Server Monitoring & Health</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography color="text.secondary">CPU Usage</Typography>
                <Typography variant="h5" fontWeight="bold">24%</Typography>
                <Typography variant="caption" color="success.main">Normal</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="text.secondary">RAM Usage</Typography>
                <Typography variant="h5" fontWeight="bold">14.2 GB</Typography>
                <Typography variant="caption" color="success.main">Normal</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color="text.secondary">API Latency</Typography>
                <Typography variant="h5" fontWeight="bold">42ms</Typography>
                <Typography variant="caption" color="success.main">Optimal</Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<StorageIcon />}>Database Backups</Button>
              <Button variant="outlined" startIcon={<NetworkCheckIcon />}>View Audit Logs</Button>
              <Button variant="outlined" startIcon={<SettingsApplicationsIcon />}>Global Settings</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%', bgcolor: '#F8FAFC' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Feature Toggles (Global)</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>Enable or disable modules across all agencies instantly.</Typography>
            <FormControlLabel control={<Switch defaultChecked color="success" />} label="WhatsApp Cloud API Sync" sx={{ display: 'block', mb: 1 }} />
            <FormControlLabel control={<Switch defaultChecked color="success" />} label="Lead Qualification Bots" sx={{ display: 'block', mb: 1 }} />
            <FormControlLabel control={<Switch defaultChecked color="success" />} label="Custom Domains" sx={{ display: 'block', mb: 1 }} />
            <FormControlLabel control={<Switch color="success" />} label="Beta Testing Features" sx={{ display: 'block' }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Agency Table */}
      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Agency Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Users</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>MRR</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agencies.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{agency.name}</TableCell>
                  <TableCell>{agency.owner}</TableCell>
                  <TableCell><Chip label={agency.plan} size="small" variant="outlined" color="primary" /></TableCell>
                  <TableCell>{agency.users}</TableCell>
                  <TableCell fontWeight="bold" color="#10B981">{agency.mrr}</TableCell>
                  <TableCell>
                    <Chip label={agency.status} color={agency.status === 'Active' ? 'success' : 'default'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Plan Creation Dialog */}
      <Dialog open={openPlan} onClose={() => setOpenPlan(false)} maxWidth="sm" fullWidth>
        <DialogTitle variant="h5" fontWeight="bold">Create SaaS Plan</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField select label="Plan Tier Base" value={planData.type} onChange={(e) => setPlanData({...planData, type: e.target.value})} fullWidth>
                <MenuItem value="Free Trial">Free Trial</MenuItem>
                <MenuItem value="Basic">Basic</MenuItem>
                <MenuItem value="Growth">Growth</MenuItem>
                <MenuItem value="Premium">Premium</MenuItem>
                <MenuItem value="Custom Enterprise">Custom Enterprise</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Plan Custom Name" fullWidth value={planData.name} onChange={(e) => setPlanData({...planData, name: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Monthly Price ($)" fullWidth value={planData.monthlyPrice} onChange={(e) => setPlanData({...planData, monthlyPrice: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Yearly Price ($)" fullWidth value={planData.yearlyPrice} onChange={(e) => setPlanData({...planData, yearlyPrice: e.target.value})} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1 }}>Plan Constraints</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={6}>
              <TextField label="Message Limit (Monthly)" type="number" fullWidth value={planData.msgLimit} onChange={(e) => setPlanData({...planData, msgLimit: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Contact Limit" type="number" fullWidth value={planData.contactLimit} onChange={(e) => setPlanData({...planData, contactLimit: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Campaign Limit" type="number" fullWidth value={planData.campaignLimit} onChange={(e) => setPlanData({...planData, campaignLimit: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="WhatsApp Numbers Limit" type="number" fullWidth value={planData.waNumberLimit} onChange={(e) => setPlanData({...planData, waNumberLimit: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenPlan(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={() => setOpenPlan(false)}>Publish Plan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SuperAdmin;
