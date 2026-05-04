import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Paper, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Avatar, Tooltip, Divider, Badge, CircularProgress
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import CloudUpload from '@mui/icons-material/CloudUpload';
import CloudDownload from '@mui/icons-material/CloudDownload';
import PersonAdd from '@mui/icons-material/PersonAdd';
import FilterList from '@mui/icons-material/FilterList';
import MoreVert from '@mui/icons-material/MoreVert';
import People from '@mui/icons-material/People';
import LocalFireDepartment from '@mui/icons-material/LocalFireDepartment';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const countryOptions = [
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: 'CA', dial: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: 'SG', dial: '+65', flag: '🇸🇬', name: 'Singapore' },
];

// Generate a pastel avatar color from a string
const stringToColor = (str = '') => {
  const colors = ['#4F46E5', '#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626', '#0891B2'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

function Contacts() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('All');
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', countryCode: 'IN', dialCode: '+91', source: 'Manual', tag: 'Cold', campaign: ''
  });

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = response.data;
      if (!Array.isArray(data)) data = [];
      setContacts(data.map(c => ({
        ...c,
        countryCode: c.country_code || 'US',
        dialCode: c.dial_code || '+1'
      })));
    } catch (error) {
      console.error('Error fetching contacts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchContacts();
  }, [token]);

  const handleAddContact = async () => {
    if (!formData.name || !formData.phone) return alert('Name and Phone are required.');
    try {
      await axios.post(`${API_URL}/api/customers`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
      setOpenAdd(false);
      setFormData({ name: '', phone: '', email: '', countryCode: 'IN', dialCode: '+91', source: 'Manual', tag: 'Cold', campaign: '' });
    } catch (error) {
      alert('Failed to add contact.');
    }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const lines = event.target.result.split(/\r?\n/);
      if (lines.length < 2) return alert('CSV is empty or missing headers.');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
      const newContacts = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        let c = { countryCode: 'US', dialCode: '+1', source: 'CSV Import', tag: 'Cold' };
        headers.forEach((h, idx) => {
          if (h.includes('name')) c.name = values[idx];
          if (h.includes('phone') || h.includes('number') || h.includes('mobile')) c.phone = values[idx];
          if (h.includes('email')) c.email = values[idx];
          if (h.includes('source')) c.source = values[idx];
          if (h.includes('tag') || h.includes('label')) c.tag = values[idx];
          if (h.includes('campaign')) c.campaign = values[idx];
        });
        if (c.name && c.phone) newContacts.push(c);
      }
      if (!newContacts.length) return alert("No valid rows found. CSV must have 'name' and 'phone' columns.");
      try {
        await axios.post(`${API_URL}/api/contacts/import`, { contacts: newContacts }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(`✅ Imported ${newContacts.length} contacts successfully!`);
        fetchContacts();
      } catch (err) {
        console.error(err);
        alert('Import failed. Please try again.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCSV = (filtered = false) => {
    const rows = filtered ? filteredContacts : contacts;
    const header = 'Name,Phone,Email,Country,Tag,Source,Campaign\n';
    const csv = rows.map(c =>
      `"${c.name || ''}","${c.dialCode || ''} ${c.phone || ''}","${c.email || ''}","${c.countryCode || ''}","${c.tag || ''}","${c.source || ''}","${c.campaign || ''}"`
    ).join('\n');
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setExportAnchor(null);
  };

  const tagCounts = { Hot: 0, Warm: 0, Cold: 0 };
  contacts.forEach(c => { if (c.tag && tagCounts[c.tag] !== undefined) tagCounts[c.tag]++; });

  const filteredContacts = contacts.filter(c => {
    const matchSearch =
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchTag = filterTag === 'All' || c.tag === filterTag;
    return matchSearch && matchTag;
  });

  const tagStyles = {
    Hot: { color: '#DC2626', bg: '#FEF2F2', icon: <LocalFireDepartment sx={{ fontSize: 14 }} /> },
    Warm: { color: '#D97706', bg: '#FFFBEB', icon: <WhatshotIcon sx={{ fontSize: 14 }} /> },
    Cold: { color: '#2563EB', bg: '#EFF6FF', icon: <AcUnitIcon sx={{ fontSize: 14 }} /> },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Header Banner ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: 3, p: 3, color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2
      }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Contacts Database</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {contacts.length} total leads · {tagCounts.Hot} hot · {tagCounts.Warm} warm · {tagCounts.Cold} cold
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportCSV} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >Import CSV</Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudDownload />}
            onClick={(e) => setExportAnchor(e.currentTarget)}
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >Export</Button>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
            <MenuItem onClick={() => handleExportCSV(true)}>Export Current View (.csv)</MenuItem>
            <MenuItem onClick={() => handleExportCSV(false)}>Export All Contacts (.csv)</MenuItem>
          </Menu>
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAdd />}
            onClick={() => setOpenAdd(true)}
            sx={{ bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' } }}
          >Add Contact</Button>
        </Box>
      </Box>

      {/* ── Stats Row ── */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Contacts', value: contacts.length, color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Hot Leads', value: tagCounts.Hot, color: '#DC2626', bg: '#FEF2F2', icon: '🔥' },
          { label: 'Warm Leads', value: tagCounts.Warm, color: '#D97706', bg: '#FFFBEB', icon: '♨️' },
          { label: 'Cold Leads', value: tagCounts.Cold, color: '#2563EB', bg: '#EFF6FF', icon: '❄️' },
        ].map((stat) => (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{ flex: 1, minWidth: 130, p: 2, borderRadius: 2, bgcolor: stat.bg, border: `1.5px solid ${stat.color}20`, cursor: 'pointer' }}
            onClick={() => setFilterTag(stat.label === 'Total Contacts' ? 'All' : stat.label.split(' ')[0])}
          >
            <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
              {stat.icon} {stat.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{stat.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* ── Search & Filter Bar ── */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by name, phone or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" color="action" /></InputAdornment>,
            sx: { bgcolor: 'background.paper', borderRadius: 2 }
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['All', 'Hot', 'Warm', 'Cold'].map(tag => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => setFilterTag(tag)}
              variant={filterTag === tag ? 'filled' : 'outlined'}
              size="small"
              sx={{
                fontWeight: 600,
                ...(filterTag === tag && {
                  bgcolor: tag === 'Hot' ? '#DC2626' : tag === 'Warm' ? '#D97706' : tag === 'Cold' ? '#2563EB' : '#4F46E5',
                  color: 'white',
                })
              }}
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {filteredContacts.length} result{filteredContacts.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* ── Table ── */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={36} />
            <Typography color="text.secondary">Loading contacts...</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  {['Contact', 'Phone', 'Email', 'Source', 'Tag', 'Campaign', ''].map(col => (
                    <TableCell key={col} sx={{ fontWeight: 700, color: '#64748B', fontSize: 11, letterSpacing: 0.5, py: 1.5 }}>
                      {col.toUpperCase()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      <People sx={{ fontSize: 48, opacity: 0.2, mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography>No contacts found</Typography>
                      <Typography variant="caption">Try adjusting your search or import a CSV file</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {filteredContacts.map((contact) => {
                  const initials = (contact.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                  const avatarColor = stringToColor(contact.name);
                  const tagStyle = tagStyles[contact.tag] || { color: '#64748B', bg: '#F1F5F9', icon: null };
                  return (
                    <TableRow
                      key={contact.id}
                      sx={{ '&:hover': { bgcolor: '#F8FAFC' }, transition: 'background 0.15s' }}
                    >
                      {/* Name + Avatar */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: avatarColor, fontSize: 13, fontWeight: 700 }}>
                            {initials}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{contact.name || '—'}</Typography>
                            <Typography variant="caption" color="text.secondary">{contact.countryCode}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {/* Phone */}
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                        {contact.dialCode} {contact.phone}
                      </TableCell>
                      {/* Email */}
                      <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                        {contact.email || '—'}
                      </TableCell>
                      {/* Source */}
                      <TableCell>
                        <Chip label={contact.source || 'Manual'} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                      </TableCell>
                      {/* Tag */}
                      <TableCell>
                        {contact.tag ? (
                          <Box sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.5,
                            px: 1, py: 0.25, borderRadius: 1,
                            bgcolor: tagStyle.bg, color: tagStyle.color, fontWeight: 700, fontSize: 12
                          }}>
                            {tagStyle.icon}
                            {contact.tag}
                          </Box>
                        ) : '—'}
                      </TableCell>
                      {/* Campaign */}
                      <TableCell>
                        {contact.campaign
                          ? <Chip label={contact.campaign} size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 600, fontSize: 11 }} />
                          : <Typography variant="caption" color="text.disabled">None</Typography>
                        }
                      </TableCell>
                      {/* Actions */}
                      <TableCell align="right">
                        <Tooltip title="Options">
                          <IconButton size="small" onClick={(e) => { setMenuAnchor(e.currentTarget); setSelectedContact(contact); }}>
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ── Row Actions Menu ── */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem disabled sx={{ fontWeight: 700, fontSize: 13, opacity: 1 }}>{selectedContact?.name}</MenuItem>
        <Divider />
        <MenuItem onClick={() => setMenuAnchor(null)}>View Details</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>Start Chat</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>Edit Contact</MenuItem>
        <Divider />
        <MenuItem sx={{ color: 'error.main' }} onClick={() => setMenuAnchor(null)}>
          <DeleteOutline fontSize="small" sx={{ mr: 1 }} /> Delete Contact
        </MenuItem>
      </Menu>

      {/* ── Add Contact Dialog ── */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">Add New Contact</Typography>
          <Typography variant="caption" color="text.secondary">All fields with * are required</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          <TextField label="Full Name *" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select label="Country *" value={formData.countryCode}
              onChange={(e) => {
                const sel = countryOptions.find(c => c.code === e.target.value);
                setFormData({ ...formData, countryCode: sel.code, dialCode: sel.dial });
              }}
              sx={{ minWidth: 170 }}
            >
              {countryOptions.map(o => (
                <MenuItem key={o.code} value={o.code}>{o.flag} {o.name} ({o.dial})</MenuItem>
              ))}
            </TextField>
            <TextField label="Phone Number *" fullWidth value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </Box>
          <TextField label="Email Address" type="email" fullWidth value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select label="Source" value={formData.source} fullWidth
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            >
              {['Manual', 'CSV Import', 'Website', 'Meta Ads', 'Referral', 'WhatsApp'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            <TextField
              select label="Tag" value={formData.tag} fullWidth
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            >
              <MenuItem value="Hot">🔥 Hot</MenuItem>
              <MenuItem value="Warm">♨️ Warm</MenuItem>
              <MenuItem value="Cold">❄️ Cold</MenuItem>
            </TextField>
          </Box>
          <TextField label="Campaign Name" fullWidth value={formData.campaign} onChange={(e) => setFormData({ ...formData, campaign: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setOpenAdd(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleAddContact} disabled={!formData.name || !formData.phone}
            sx={{ bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' } }}>
            Save Contact
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Contacts;
