import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function SuperAdmin() {
  const { token, user } = useAuth();
  // Mock data for Super Admin view
  const [stats] = useState({
    totalAgencies: 15,
    totalAgents: 42,
    mrr: '$1,250',
    recentSignups: [
      { id: 1, name: 'Acme Corp', plan: 'Pro', date: '2023-10-25' },
      { id: 2, name: 'TechFlow', plan: 'Enterprise', date: '2023-10-24' },
      { id: 3, name: 'Local Shop', plan: 'Free', date: '2023-10-23' }
    ]
  });

  if (user?.role !== 'SUPER_ADMIN') {
    return <Typography>Unauthorized</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Super Admin Dashboard</Typography>
      <Typography color="text.secondary" mb={4}>Global overview of the Vamkor SaaS Platform.</Typography>

      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Agencies</Typography>
              <Typography variant="h3" fontWeight="bold">{stats.totalAgencies}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Active Agents</Typography>
              <Typography variant="h3" fontWeight="bold">{stats.totalAgents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Monthly Recurring Revenue (MRR)</Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">{stats.mrr}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="bold" gutterBottom>Recent Agency Signups</Typography>
      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company Name</TableCell>
                <TableCell>Subscription Plan</TableCell>
                <TableCell>Join Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.recentSignups.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.plan}</TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default SuperAdmin;
