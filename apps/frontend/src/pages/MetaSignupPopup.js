import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Avatar, Radio, RadioGroup, FormControlLabel, FormControl, Select, MenuItem, InputLabel, Stepper, Step, StepLabel } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function MetaSignupPopup() {
  const [step, setStep] = useState(0);
  const [portfolio, setPortfolio] = useState('portfolio_1');
  const [waAccount, setWaAccount] = useState('wa_acc_1');
  const [phoneNumber, setPhoneNumber] = useState('15550192834');

  const portfolios = [
    { id: 'portfolio_1', name: 'Vamkor Marketing Group LLC' },
    { id: 'portfolio_2', name: 'Swaraj Enterprises' }
  ];

  const waAccounts = [
    { id: 'wa_acc_1', name: 'Vamkor primary WhatsApp Business Profile' },
    { id: 'wa_acc_2', name: 'Swaraj Support Account' }
  ];

  const phoneNumbers = [
    { id: '15550192834', display: '+1 (555) 019-2834 (Verified Primary)' },
    { id: '919876543210', display: '+91 98765 43210 (Verified Support)' }
  ];

  const handleCancel = () => {
    window.close();
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Finalize and send data back to parent
      const credentials = {
        phoneNumberId: phoneNumber,
        whatsappBusinessAccountId: waAccount,
        accessToken: `EAAGm0PX4ZB0sBA${Math.random().toString(36).substring(2, 15).toUpperCase()}ZCZB`
      };

      if (window.opener) {
        window.opener.postMessage({
          type: 'META_SIGNUP_SUCCESS',
          credentials
        }, '*');
      }
      setStep(4);
      setTimeout(() => {
        window.close();
      }, 1500);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F0F2F5', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' }}>
      {/* Meta/FB Header Bar */}
      <Box sx={{ bgcolor: '#1877F2', color: 'white', px: 3, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FacebookIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem', letterSpacing: -0.5 }}>Facebook Login</Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>Embedded Signup Flow</Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 500, p: 4, borderRadius: 2 }}>
          {step < 4 && (
            <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
              <Step><StepLabel>Auth</StepLabel></Step>
              <Step><StepLabel>Portfolio</StepLabel></Step>
              <Step><StepLabel>Profile</StepLabel></Step>
              <Step><StepLabel>Number</StepLabel></Step>
            </Stepper>
          )}

          {step === 0 && (
            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: '#1877F2', mb: 1 }}>
                <FacebookIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold">Connect to VAMKOR CRM</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                Log in to Facebook to grant VAMKOR CRM permission to manage your WhatsApp Business portfolios, accounts, and messaging.
              </Typography>
              
              <Box sx={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', justifyBetween: 'center', gap: 2, mt: 2, bgcolor: '#F8FAFC' }}>
                <Avatar sx={{ width: 40, height: 40 }}>S</Avatar>
                <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Swaraj CRM Manager</Typography>
                  <Typography variant="caption" color="text.secondary">Active Account</Typography>
                </Box>
              </Box>

              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
                <Button variant="contained" fullWidth sx={{ bgcolor: '#1877F2', py: 1.2, fontWeight: 'bold', '&:hover': { bgcolor: '#166FE5' } }} onClick={handleNext}>
                  Continue as Swaraj
                </Button>
                <Button variant="outlined" fullWidth color="inherit" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {step === 1 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Select Meta Business Portfolio</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose the Business Manager portfolio containing your target WhatsApp numbers.
              </Typography>

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup value={portfolio} onChange={(e) => setPortfolio(e.target.value)}>
                  {portfolios.map((p) => (
                    <Box key={p.id} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, px: 2, py: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', '&:hover': { borderColor: '#1877F2' } }}>
                      <FormControlLabel value={p.id} control={<Radio color="primary" />} label={<Typography fontWeight="bold" variant="body2">{p.name}</Typography>} sx={{ width: '100%', m: 0 }} />
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={() => setStep(0)} color="inherit">Back</Button>
                <Button variant="contained" sx={{ bgcolor: '#1877F2', '&:hover': { bgcolor: '#166FE5' } }} onClick={handleNext}>Next</Button>
              </Box>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Select WhatsApp Business Profile</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select the WhatsApp Profile linked to your organization.
              </Typography>

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup value={waAccount} onChange={(e) => setWaAccount(e.target.value)}>
                  {waAccounts.map((a) => (
                    <Box key={a.id} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, px: 2, py: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', '&:hover': { borderColor: '#1877F2' } }}>
                      <FormControlLabel value={a.id} control={<Radio color="primary" />} label={<Typography fontWeight="bold" variant="body2">{a.name}</Typography>} sx={{ width: '100%', m: 0 }} />
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={() => setStep(1)} color="inherit">Back</Button>
                <Button variant="contained" sx={{ bgcolor: '#1877F2', '&:hover': { bgcolor: '#166FE5' } }} onClick={handleNext}>Next</Button>
              </Box>
            </Box>
          )}

          {step === 3 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Verify Registered Phone Number</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose the verified sender number to import into the CRM database.
              </Typography>

              <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel>Sender Number</InputLabel>
                <Select value={phoneNumber} label="Sender Number" onChange={(e) => setPhoneNumber(e.target.value)}>
                  {phoneNumbers.map((num) => (
                    <MenuItem key={num.id} value={num.id}>{num.display}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={() => setStep(2)} color="inherit">Back</Button>
                <Button variant="contained" sx={{ bgcolor: '#1877F2', '&:hover': { bgcolor: '#166FE5' } }} onClick={handleNext}>Finish Setup</Button>
              </Box>
            </Box>
          )}

          {step === 4 && (
            <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 70, color: '#06c167' }} />
              <Typography variant="h5" fontWeight="bold">Connection Success!</Typography>
              <Typography color="text.secondary">VAMKOR CRM is now linked to Meta API.</Typography>
              <Typography variant="caption" color="text.secondary">Closing setup window...</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Footer bar */}
      <Box sx={{ py: 2, textAlign: 'center', borderTop: '1px solid #E2E8F0', bgcolor: 'white' }}>
        <Typography variant="caption" color="text.secondary">Meta Developer Platform Embedded Onboarding</Typography>
      </Box>
    </Box>
  );
}

export default MetaSignupPopup;
