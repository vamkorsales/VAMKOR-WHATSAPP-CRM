import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, TextField, Select, MenuItem, 
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Menu, Alert, Snackbar, Tabs, Tab, CircularProgress
} from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import axios from 'axios';
import { useAuth } from '../AuthContext';

function Integration() {
  const { token } = useAuth();
  const [tokenType, setTokenType] = useState('Permanent');
  const [waMenuAnchor, setWaMenuAnchor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Meta Config State
  const [metaConfig, setMetaConfig] = useState({
    phoneNumberId: '',
    whatsappBusinessAccountId: '',
    accessToken: ''
  });

  // OpenWA State
  const [integrationTab, setIntegrationTab] = useState(0);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [waConnectionType, setWaConnectionType] = useState('meta');

  const handleWaMenuOpen = (event) => setWaMenuAnchor(event.currentTarget);
  const handleWaMenuClose = () => setWaMenuAnchor(null);

  // Fetch existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/integration', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetaConfig({
          phoneNumberId: res.data.phoneNumberId || '',
          whatsappBusinessAccountId: res.data.whatsappBusinessAccountId || '',
          accessToken: res.data.accessToken || ''
        });
        if (res.data.whatsappConnectionType) {
          setWaConnectionType(res.data.whatsappConnectionType);
          setIntegrationTab(res.data.whatsappConnectionType === 'openwa' ? 1 : 0);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    if (token) fetchSettings();
  }, [token]);

  const handleSaveMetaConfig = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/integration', {
        ...metaConfig,
        whatsappConnectionType: 'meta'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Meta WhatsApp API configuration saved successfully!');
      setWaConnectionType('meta');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
    setLoading(false);
  };

  const handleOpenWASetup = async () => {
    setQrLoading(true);
    try {
      // Start session
      await axios.post('http://localhost:5001/api/openwa/session/start', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Wait a moment for engine to initialize
      setTimeout(async () => {
        try {
          const res = await axios.get('http://localhost:5001/api/openwa/session/qr', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setQrCodeData(res.data.qrCode);
          
          // Save connection type
          await axios.post('http://localhost:5001/api/integration', {
            whatsappConnectionType: 'openwa'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWaConnectionType('openwa');
          setSuccessMsg('Session started! Scan the QR code with WhatsApp.');
        } catch (qrErr) {
           console.error('QR Fetch Error:', qrErr);
           alert(qrErr.response?.data?.error || 'Failed to fetch QR. Try again.');
        }
        setQrLoading(false);
      }, 5000); // 5 sec wait
    } catch (error) {
      console.error('Failed to start OpenWA:', error);
      alert('Failed to start WhatsApp Web session');
      setQrLoading(false);
    }
  };

  // Mock API Keys
  const [apiKeys] = useState([
    { id: 1, name: 'Main Production API', key: 'vam_live_9f8d7...', secret: '••••••••••••', role: 'Super Admin', status: 'Active', expiry: 'Never' },
  ]);

  // Mock WhatsApp Numbers (Could later be fetched from DB or Meta API directly)
  const [waNumbers] = useState([
    { id: 1, phone: metaConfig.phoneNumberId ? `Phone ID: ${metaConfig.phoneNumberId}` : 'Not Configured', country: 'Global', business: 'Connected Meta App', status: metaConfig.phoneNumberId ? 'Connected' : 'Pending' }
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>System Integration</Typography>
        <Typography color="text.secondary">Manage your API Keys and WhatsApp Cloud API connections here.</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={integrationTab} onChange={(e, v) => setIntegrationTab(v)}>
          <Tab label="Meta Cloud API (Official)" />
          <Tab label="WhatsApp Web (QR Code)" />
        </Tabs>
      </Box>

      {integrationTab === 0 && (
        <Paper elevation={1} sx={{ p: 3, borderLeft: '4px solid #06c167' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Meta WhatsApp Cloud API Configuration</Typography>
            {waConnectionType === 'meta' && <Chip label="Active Provider" color="success" size="small" />}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            To connect your own WhatsApp Business number, create a Meta Developer App, add the WhatsApp product, and generate a system user token. Enter those details below to start receiving and sending messages.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Phone Number ID" 
                variant="outlined" 
                value={metaConfig.phoneNumberId}
                onChange={(e) => setMetaConfig({...metaConfig, phoneNumberId: e.target.value})}
                helperText="Found in Meta App -> WhatsApp -> Getting Started"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="WhatsApp Business Account ID" 
                variant="outlined" 
                value={metaConfig.whatsappBusinessAccountId}
                onChange={(e) => setMetaConfig({...metaConfig, whatsappBusinessAccountId: e.target.value})}
                helperText="Found in Meta App -> WhatsApp -> Getting Started"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Permanent Access Token" 
                variant="outlined" 
                type="password"
                value={metaConfig.accessToken}
                onChange={(e) => setMetaConfig({...metaConfig, accessToken: e.target.value})}
                helperText="System User Token with messaging permissions"
              />
            </Grid>
            <Grid item xs={12}>
               <Button variant="contained" color="success" onClick={handleSaveMetaConfig} disabled={loading}>
                 {loading ? 'Saving...' : 'Save Meta Configuration'}
               </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {integrationTab === 1 && (
        <Paper elevation={1} sx={{ p: 3, borderLeft: '4px solid #25D366' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">WhatsApp Web Configuration (OpenWA)</Typography>
            {waConnectionType === 'openwa' && <Chip label="Active Provider" color="success" size="small" />}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Link your personal or business WhatsApp account directly by scanning a QR Code. This bypasses the Meta API restrictions and costs.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <QrCode2Icon sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Link your device</Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
              Click the button below to start the WhatsApp engine and generate a unique QR code. Open WhatsApp on your phone and scan it.
            </Typography>

            {qrCodeData ? (
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', mb: 3 }}>
                 <img src={qrCodeData} alt="WhatsApp QR Code" style={{ width: 256, height: 256 }} />
              </Box>
            ) : qrLoading ? (
              <CircularProgress sx={{ mb: 3 }} />
            ) : null}

            <Button 
              variant="contained" 
              sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
              onClick={handleOpenWASetup}
              disabled={qrLoading}
            >
              {qrLoading ? 'Starting Engine...' : qrCodeData ? 'Regenerate QR Code' : 'Generate QR Code'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* WhatsApp Numbers Management */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">WhatsApp Numbers</Typography>
          <Button variant="contained" color="success" onClick={() => alert('Future feature: Embedded Signup Flow')}>Connect via Facebook</Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone Details</TableCell>
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
          <Typography variant="h6" fontWeight="bold">Internal API Keys</Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Token Generation Type</InputLabel>
              <Select 
                value={tokenType} 
                label="Token Generation Type" 
                onChange={(e) => setTokenType(e.target.value)}
              >
                <MenuItem value="Permanent">Permanent Token</MenuItem>
                <MenuItem value="Temporary">Temporary Token (24h)</MenuItem>
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
      
      <Snackbar open={!!successMsg} autoHideDuration={6000} onClose={() => setSuccessMsg('')}>
        <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Integration;
