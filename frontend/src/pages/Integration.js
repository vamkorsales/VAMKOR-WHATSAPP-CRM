import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, TextField, Select, MenuItem, 
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Menu
} from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import QrCode2Icon from '@mui/icons-material/QrCode2';

function Integration() {
  const [tokenType, setTokenType] = useState('Permanent');
  const [waMenuAnchor, setWaMenuAnchor] = useState(null);

  const handleWaMenuOpen = (event) => setWaMenuAnchor(event.currentTarget);
  const handleWaMenuClose = () => setWaMenuAnchor(null);

  // Mock API Keys
  const [apiKeys] = useState([
    { id: 1, name: 'Main Production API', key: 'vam_live_9f8d7...', secret: '••••••••••••', role: 'Super Admin', status: 'Active', expiry: 'Never' },
    { id: 2, name: 'Marketing Zapier', key: 'vam_live_3c4a1...', secret: '••••••••••••', role: 'Sales Agent', status: 'Active', expiry: '2027-01-01' },
    { id: 3, name: 'Temp Testing Key', key: 'vam_test_1b2c3...', secret: '••••••••••••', role: 'Developer', status: 'Revoked', expiry: '2023-12-31' },
  ]);

  // Mock WhatsApp Numbers
  const [waNumbers] = useState([
    { id: 1, phone: '+1 415 555 2671', country: '🇺🇸 US', business: 'Vamkor HQ', status: 'Connected' },
    { id: 2, phone: '+91 98765 43210', country: '🇮🇳 IN', business: 'Vamkor Asia', status: 'Pending' },
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>System Integration</Typography>
        <Typography color="text.secondary">Manage your API Keys and WhatsApp Cloud API connections here.</Typography>
      </Box>

      {/* WhatsApp Numbers Management */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">WhatsApp Numbers</Typography>
          <Button variant="contained" color="success">➕ Add Number</Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Business Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {waNumbers.map((num) => (
                <TableRow key={num.id}>
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{num.phone}</TableCell>
                  <TableCell>{num.country}</TableCell>
                  <TableCell>{num.business}</TableCell>
                  <TableCell>
                    <Chip 
                      label={num.status} 
                      color={num.status === 'Connected' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={handleWaMenuOpen}><MoreVertIcon /></IconButton>
                    <Menu anchorEl={waMenuAnchor} open={Boolean(waMenuAnchor)} onClose={handleWaMenuClose}>
                      <MenuItem onClick={handleWaMenuClose}>Connect via Meta API</MenuItem>
                      <MenuItem onClick={handleWaMenuClose}><QrCode2Icon sx={{ mr: 1 }} fontSize="small"/> View QR Code</MenuItem>
                      <MenuItem onClick={handleWaMenuClose}>Assign to Campaign</MenuItem>
                      <MenuItem onClick={handleWaMenuClose} sx={{ color: 'error.main' }}>Disconnect</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* API Key Management */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" fontWeight="bold">API Keys</Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Token Generation Type</InputLabel>
              <Select 
                value={tokenType} 
                label="Token Generation Type" 
                onChange={(e) => setTokenType(e.target.value)}
                sx={{ 
                  bgcolor: tokenType === 'Permanent' ? '#ECFDF5' : '#FEF2F2',
                  color: tokenType === 'Permanent' ? '#047857' : '#B91C1C',
                  fontWeight: 'bold'
                }}
              >
                <MenuItem value="Permanent" sx={{ color: '#047857', fontWeight: 'bold' }}>Permanent Token</MenuItem>
                <MenuItem value="Temporary" sx={{ color: '#B91C1C', fontWeight: 'bold' }}>Temporary Token (24h)</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained">Generate New Key</Button>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>API Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>API Key</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Secret Key</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Linked Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiKeys.map((api) => (
                <TableRow key={api.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{api.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <code style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '4px' }}>{api.key}</code>
                      <IconButton size="small"><FileCopyIcon fontSize="inherit" /></IconButton>
                    </Box>
                  </TableCell>
                  <TableCell><code style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '4px' }}>{api.secret}</code></TableCell>
                  <TableCell>{api.role}</TableCell>
                  <TableCell>{api.expiry}</TableCell>
                  <TableCell>
                    <Chip label={api.status} color={api.status === 'Active' ? 'success' : 'default'} size="small" />
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

export default Integration;
