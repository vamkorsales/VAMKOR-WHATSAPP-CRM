import React from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Switch, FormControlLabel, Divider
} from '@mui/material';

function Settings() {
  return (
    <Box sx={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Profile Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Manage your account details and preferences.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField 
            label="Full Name" 
            variant="outlined" 
            fullWidth
            defaultValue="Pratiksha Nandedkar"
          />
          <TextField 
            label="Email Address" 
            variant="outlined" 
            fullWidth
            type="email"
            defaultValue="pratiksha@vamkor.com"
          />
          <Button variant="contained" sx={{ alignSelf: 'flex-start', mt: 2 }}>
            Save Changes
          </Button>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Notifications</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Configure how you receive alerts.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel 
            control={<Switch defaultChecked color="primary" />} 
            label="Email Notifications" 
            sx={{ m: 0, justifyContent: 'space-between', flexDirection: 'row-reverse' }}
          />
          <Divider />
          <FormControlLabel 
            control={<Switch defaultChecked color="primary" />} 
            label="Desktop Notifications for New Messages" 
            sx={{ m: 0, justifyContent: 'space-between', flexDirection: 'row-reverse' }}
          />
        </Box>
      </Paper>

    </Box>
  );
}

export default Settings;
