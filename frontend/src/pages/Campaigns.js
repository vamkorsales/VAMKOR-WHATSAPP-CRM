import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, Chip } from '@mui/material';

function Campaigns() {
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'Black Friday Blast', status: 'active', leads: 450 },
    { id: 2, name: 'Welcome Series', status: 'paused', leads: 1200 },
    { id: 3, name: 'Re-engagement 2024', status: 'active', leads: 320 }
  ]);

  const handleToggle = (id) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c
    ));
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Campaign Management</Typography>
      <Typography color="text.secondary" mb={4}>Activate or pause your WhatsApp campaigns.</Typography>
      
      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Total Leads</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>On / Off</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell fontWeight="bold">{c.name}</TableCell>
                  <TableCell>{c.leads}</TableCell>
                  <TableCell>
                    <Chip label={c.status} color={c.status === 'active' ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={c.status === 'active'} onChange={() => handleToggle(c.id)} color="primary" />
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

export default Campaigns;
