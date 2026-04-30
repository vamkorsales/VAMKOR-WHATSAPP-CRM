import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Paper, Typography, Button, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow 
} from '@mui/material';
import { Upload, Download, Search } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers`);
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const handleMockImport = async () => {
    setIsImporting(true);
    try {
      const mockNewContacts = [
        { name: 'Alice Johnson', phone: '+1122334455', email: 'alice@example.com' },
        { name: 'Bob Williams', phone: '+9988776655', email: 'bob@example.com' }
      ];
      await axios.post(`${API_URL}/api/contacts/import`, { contacts: mockNewContacts });
      await fetchContacts();
      alert('Successfully imported 2 contacts (Mock)');
    } catch (err) {
      console.error('Import failed', err);
    }
    setIsImporting(false);
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Actions Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            sx: { bgcolor: 'background.paper', borderRadius: 2, width: { xs: '100%', sm: 300 } }
          }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Download />} color="inherit" sx={{ bgcolor: 'background.paper' }}>
            Export CSV
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Upload />} 
            onClick={handleMockImport} 
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : 'Import CSV'}
          </Button>
        </Box>
      </Box>

      {/* Data Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>NAME</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>PHONE NUMBER</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>EMAIL</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>DATE ADDED</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                  {contact.name}
                </TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{contact.email || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{new Date(contact.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No contacts found.
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
