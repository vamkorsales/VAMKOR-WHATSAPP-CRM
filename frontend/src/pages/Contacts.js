import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Paper, Typography, Button, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Menu, MenuItem, IconButton, Tooltip
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import CloudUpload from '@mui/icons-material/CloudUpload';
import CloudDownload from '@mui/icons-material/CloudDownload';
import MoreVert from '@mui/icons-material/MoreVert';
import ReactCountryFlag from 'react-country-flag';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Complex mock data to fulfill requirements
const advancedMockContacts = [
  { id: 1, name: 'Alice Johnson', phone: '1122334455', countryCode: 'US', dialCode: '+1', email: 'alice@example.com', source: 'Facebook Ad', tag: 'Hot', campaign: 'Q3 Promo', lastContacted: '2 hours ago' },
  { id: 2, name: 'Rahul Sharma', phone: '9876543210', countryCode: 'IN', dialCode: '+91', email: 'rahul@example.com', source: 'Organic Search', tag: 'Warm', campaign: 'Welcome Series', lastContacted: '1 day ago' },
  { id: 3, name: 'Omar Al Fayed', phone: '501234567', countryCode: 'AE', dialCode: '+971', email: 'omar@example.com', source: 'Referral', tag: 'Hot', campaign: 'VIP Outreach', lastContacted: '5 mins ago' },
  { id: 4, name: 'Sarah Williams', phone: '7890123456', countryCode: 'GB', dialCode: '+44', email: 'sarah@example.com', source: 'Webinar', tag: 'Cold', campaign: 'Nurture', lastContacted: '1 week ago' },
];

function Contacts() {
  const [contacts, setContacts] = useState(advancedMockContacts);
  const [search, setSearch] = useState('');
  
  // Menu states
  const [importAnchor, setImportAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.email.includes(search)
  );

  const handleImportClose = () => setImportAnchor(null);
  const handleExportClose = () => setExportAnchor(null);

  const getTagColor = (tag) => {
    switch(tag.toLowerCase()) {
      case 'hot': return 'error';
      case 'warm': return 'warning';
      case 'cold': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Header & Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Contacts Database</Typography>
          <Typography variant="body2" color="text.secondary">Manage your leads, segment audiences, and sync with Google Sheets.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          
          <Button 
            variant="outlined" 
            startIcon={<CloudDownload />} 
            onClick={(e) => setExportAnchor(e.currentTarget)}
            sx={{ bgcolor: 'background.paper' }}
          >
            Export Options
          </Button>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={handleExportClose}>
            <MenuItem onClick={handleExportClose}>Filtered Export (Current View)</MenuItem>
            <MenuItem onClick={handleExportClose}>Full Database Export (.csv)</MenuItem>
            <MenuItem onClick={handleExportClose}>Export by Campaign...</MenuItem>
          </Menu>

          <Button 
            variant="contained" 
            startIcon={<CloudUpload />} 
            onClick={(e) => setImportAnchor(e.currentTarget)}
          >
            Import Leads
          </Button>
          <Menu anchorEl={importAnchor} open={Boolean(importAnchor)} onClose={handleImportClose}>
            <MenuItem onClick={handleImportClose}>Upload CSV File</MenuItem>
            <MenuItem onClick={handleImportClose}>Upload Excel (.xlsx)</MenuItem>
            <MenuItem onClick={handleImportClose}>Sync with Google Sheets</MenuItem>
          </Menu>

        </Box>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            sx: { bgcolor: 'background.paper', borderRadius: 2, width: { xs: '100%', sm: 400 } }
          }}
        />
      </Box>

      {/* Advanced Data Grid */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1000 }} size="small">
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', py: 2 }}>NAME</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>COUNTRY 🌍</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>PHONE</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>EMAIL</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>SOURCE</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>TAG</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CAMPAIGN</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>LAST CONTACTED</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 600 }}>{contact.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReactCountryFlag countryCode={contact.countryCode} svg style={{ width: '1.5em', height: '1.5em', borderRadius: '2px' }} />
                    <Typography variant="body2">{contact.countryCode}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{contact.dialCode} {contact.phone}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{contact.email}</TableCell>
                <TableCell>{contact.source}</TableCell>
                <TableCell>
                  <Chip label={contact.tag} size="small" color={getTagColor(contact.tag)} sx={{ fontWeight: 'bold' }} />
                </TableCell>
                <TableCell>
                  <Chip label={contact.campaign} size="small" variant="outlined" />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{contact.lastContacted}</TableCell>
                <TableCell align="right">
                  <IconButton size="small"><MoreVert fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No contacts found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
}

export default Contacts;
