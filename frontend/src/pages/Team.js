import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Select, InputLabel, FormControl, Chip, OutlinedInput, Checkbox, 
  FormControlLabel, Grid, Divider
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const roles = ['Manager', 'Sales Agent', 'Support Agent'];
const availableCampaigns = ['Black Friday Blast', 'Welcome Series', 'Re-engagement 2024'];
const availableCountries = ['United States', 'India', 'UAE', 'United Kingdom', 'Canada'];

const permissionModules = ['Dashboard', 'Contacts', 'Campaigns', 'Templates', 'WhatsApp Chat', 'Analytics', 'Billing', 'API', 'Settings'];
const permissionActions = ['View', 'Add', 'Edit', 'Delete'];

function Team() {
  const { token } = useAuth();
  const [agents, setAgents] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    contactNumber: '',
    role: 'Sales Agent',
    assigned_campaigns: [],
    assigned_countries: [],
    status: 'Active'
  });

  // State for the permission matrix
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgents(response.data);
    } catch (error) {
      console.error("Failed to fetch agents", error);
    }
  };

  const handleAddAgent = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/agents`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpen(false);
      fetchAgents();
    } catch (error) {
      alert("Failed to add agent.");
    }
  };

  const handlePermissionChange = (module, action) => {
    setPermissions(prev => ({
      ...prev,
      [`${module}_${action}`]: !prev[`${module}_${action}`]
    }));
  };

  const applyPermissionTemplate = (roleType) => {
    const newPerms = {};
    permissionModules.forEach(mod => {
      permissionActions.forEach(act => {
        if (roleType === 'Manager') {
          newPerms[`${mod}_${act}`] = true;
        } else if (roleType === 'Sales Agent') {
          if (['Contacts', 'Campaigns', 'WhatsApp Chat'].includes(mod) && act !== 'Delete') {
            newPerms[`${mod}_${act}`] = true;
          }
        } else if (roleType === 'Support Agent') {
          if (['WhatsApp Chat', 'Contacts'].includes(mod) && ['View', 'Add'].includes(act)) {
            newPerms[`${mod}_${act}`] = true;
          }
        }
      });
    });
    setPermissions(newPerms);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Team Management</Typography>
        <Button variant="contained" onClick={() => setOpen(true)} size="large">➕ Add User</Button>
      </Box>

      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date Added</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No agents found. Add one to get started.</TableCell></TableRow>
              ) : (
                agents.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell fontWeight="bold">{row.username}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      <Chip label={row.role || 'AGENT'} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.status || 'Active'} size="small" color={row.status === 'Disabled' ? 'error' : 'success'} />
                    </TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Advanced Add User Form Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle variant="h5" fontWeight="bold">Add New User</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom color="primary">Basic Info</Typography>
          <Grid container spacing={2} mb={4}>
            <Grid item xs={12} sm={6}>
              <TextField label="Full Name" fullWidth value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" type="email" fullWidth value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone Number" fullWidth value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Temporary Password" type="password" fullWidth value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom color="primary">Access & Assignment</Typography>
          <Grid container spacing={2} mb={4}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={formData.role} label="Role" onChange={(e) => {
                  setFormData({...formData, role: e.target.value});
                  applyPermissionTemplate(e.target.value);
                }}>
                  {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} label="Status" onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Disabled">Disabled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned Campaigns</InputLabel>
                <Select
                  multiple
                  value={formData.assigned_campaigns}
                  onChange={(e) => setFormData({...formData, assigned_campaigns: e.target.value})}
                  input={<OutlinedInput label="Assigned Campaigns" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                    </Box>
                  )}
                >
                  {availableCampaigns.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned Countries 🌍</InputLabel>
                <Select
                  multiple
                  value={formData.assigned_countries}
                  onChange={(e) => setFormData({...formData, assigned_countries: e.target.value})}
                  input={<OutlinedInput label="Assigned Countries 🌍" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                    </Box>
                  )}
                >
                  {availableCountries.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 4 }}>
            <Typography variant="h6" color="primary">Permission Types (Matrix)</Typography>
            <Box>
              <Typography variant="caption" sx={{ mr: 1 }}>Templates:</Typography>
              <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => applyPermissionTemplate('Manager')}>Manager</Button>
              <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => applyPermissionTemplate('Sales Agent')}>Sales</Button>
            </Box>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell>Module</TableCell>
                  {permissionActions.map(act => <TableCell key={act} align="center">{act}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {permissionModules.map(mod => (
                  <TableRow key={mod}>
                    <TableCell fontWeight="bold">{mod}</TableCell>
                    {permissionActions.map(act => (
                      <TableCell key={act} align="center">
                        <Checkbox 
                          size="small" 
                          checked={permissions[`${mod}_${act}`] || false} 
                          onChange={() => handlePermissionChange(mod, act)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAgent} size="large">Create User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Team;
