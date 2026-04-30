import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Team() {
  const { token } = useAuth();
  const [agents, setAgents] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', contactNumber: '' });

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Team Management</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Add Agent</Button>
      </Box>

      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Contact Number</TableCell>
                <TableCell>Date Added</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">No agents found. Add one to get started.</TableCell></TableRow>
              ) : (
                agents.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.contact_number}</TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Agent</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Username" fullWidth value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
          <TextField margin="dense" label="Email" type="email" fullWidth value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <TextField margin="dense" label="Contact Number" fullWidth value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} />
          <TextField margin="dense" label="Temporary Password" type="password" fullWidth value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAgent}>Add Agent</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Team;
