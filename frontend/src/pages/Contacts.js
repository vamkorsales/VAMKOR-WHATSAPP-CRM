import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Paper, Typography, Button, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import CloudUpload from '@mui/icons-material/CloudUpload';
import CloudDownload from '@mui/icons-material/CloudDownload';
import MoreVert from '@mui/icons-material/MoreVert';
import ReactCountryFlag from 'react-country-flag';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const countryOptions = [
  { code: 'US', dial: '+1', flag: '🇺🇸' },
  { code: 'IN', dial: '+91', flag: '🇮🇳' },
  { code: 'AE', dial: '+971', flag: '🇦🇪' },
  { code: 'GB', dial: '+44', flag: '🇬🇧' },
];

function Contacts() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', countryCode: 'IN', dialCode: '+91', source: '', tag: 'Cold', campaign: ''
  });
  
  const [importAnchor, setImportAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/customers`, { headers: { Authorization: `Bearer ${token}` } });
      
      // Ensure we have an array to map over
      let data = response.data;
      if (!Array.isArray(data)) {
        if (data.error) throw new Error(data.error);
        data = [];
      }
      
      const mappedContacts = data.map(c => ({
        ...c,
        countryCode: c.country_code || 'US',
        dialCode: c.dial_code || '+1'
      }));
      setContacts(mappedContacts);
    } catch (error) {
      console.error("Error fetching contacts", error);
      alert("Unable to fetch contacts data.");
    }
  };

  useEffect(() => {
    if (token) fetchContacts();
  }, [token]);

  const handleAddContact = async () => {
    try {
      await axios.post(`${API_URL}/api/customers`, formData, { headers: { Authorization: `Bearer ${token}` } });
      fetchContacts();
      setOpenAdd(false);
      setFormData({ name: '', phone: '', email: '', countryCode: 'IN', dialCode: '+91', source: '', tag: 'Cold', campaign: '' });
    } catch (error) {
      alert("Failed to add contact");
    }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      const lines = csvData.split(/\r?\n/);
      if (lines.length < 2) return alert("CSV file is empty or missing headers.");
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const newContacts = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim());
        let contact = { countryCode: 'US', dialCode: '+1' }; // defaults
        headers.forEach((h, index) => {
          if (h.includes('name')) contact.name = values[index];
          if (h.includes('phone') || h.includes('number')) contact.phone = values[index];
          if (h.includes('email')) contact.email = values[index];
          if (h.includes('source')) contact.source = values[index];
          if (h.includes('tag')) contact.tag = values[index];
          if (h.includes('campaign')) contact.campaign = values[index];
        });
        if (contact.name && contact.phone) newContacts.push(contact);
      }
      
      if (newContacts.length === 0) {
        return alert("No valid contacts found in the CSV. Please ensure you have 'name' and 'phone' columns.");
      }

      try {
        await axios.post(`${API_URL}/api/contacts/import`, { contacts: newContacts }, { headers: { Authorization: `Bearer ${token}` } });
        alert(`Successfully imported ${newContacts.length} contacts!`);
        fetchContacts();
      } catch (err) {
        console.error('Import failed', err);
        alert("Failed to import contacts. Please check your network and try again.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const handleImportClose = () => setImportAnchor(null);
  const handleExportClose = () => setExportAnchor(null);

  const filteredContacts = contacts.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.phone || '').includes(search) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const getTagColor = (tag) => {
    switch(tag?.toLowerCase()) {
      case 'hot': return 'error';
      case 'warm': return 'warning';
      case 'cold': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Contacts Database</Typography>
          <Typography variant="body2" color="text.secondary">Manage your leads, segment audiences, and sync with Google Sheets.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImportCSV} 
          />
          <Button 
            variant="outlined" 
            startIcon={<CloudUpload />} 
            onClick={() => fileInputRef.current?.click()}
            sx={{ bgcolor: 'background.paper' }}
          >
            Import CSV
          </Button>

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
          </Menu>

          <Button variant="contained" onClick={() => setOpenAdd(true)}>+ Add Contact</Button>
        </Box>
      </Box>

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

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1000 }} size="small">
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', py: 2 }}>NAME</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>COUNTRY</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>PHONE</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>EMAIL</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>SOURCE</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>TAG</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CAMPAIGN</TableCell>
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
                <TableCell align="right">
                  <IconButton size="small"><MoreVert fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Contact</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" fullWidth value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Country" value={formData.countryCode} onChange={(e) => {
              const selected = countryOptions.find(c => c.code === e.target.value);
              setFormData({...formData, countryCode: selected.code, dialCode: selected.dial});
            }} sx={{ minWidth: 150 }}>
              {countryOptions.map(option => (
                <MenuItem key={option.code} value={option.code}>{option.flag} {option.code} ({option.dial})</MenuItem>
              ))}
            </TextField>
            <TextField label="Phone Number" fullWidth value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </Box>
          <TextField label="Email" type="email" fullWidth value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <TextField label="Source" fullWidth value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Tag" value={formData.tag} onChange={(e) => setFormData({...formData, tag: e.target.value})} fullWidth>
              <MenuItem value="Hot">Hot</MenuItem>
              <MenuItem value="Warm">Warm</MenuItem>
              <MenuItem value="Cold">Cold</MenuItem>
            </TextField>
            <TextField label="Campaign" fullWidth value={formData.campaign} onChange={(e) => setFormData({...formData, campaign: e.target.value})} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddContact}>Save Contact</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Contacts;
