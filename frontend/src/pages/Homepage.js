import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Grid, Paper } from '@mui/material';
import { ArrowForward, ChatBubbleOutline, PeopleOutline, Bolt } from '@mui/icons-material';

function Homepage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <Box sx={{ py: 3, px: { xs: 2, md: 6 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatBubbleOutline color="primary" fontSize="large" />
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Vamkor
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="text" color="inherit" onClick={() => navigate('/dashboard/chat')}>
            Log in
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate('/dashboard/chat')} sx={{ borderRadius: 8 }}>
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 12, textAlign: 'center' }}>
        <Box 
          sx={{ 
            display: 'inline-block', 
            py: 0.5, px: 2, 
            borderRadius: 8, 
            bgcolor: 'primary.light', 
            color: 'primary.contrastText',
            mb: 4,
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}
        >
          New: WhatsApp API Integration
        </Box>
        
        <Typography variant="h2" component="h1" fontWeight="800" gutterBottom sx={{ letterSpacing: -1 }}>
          The Ultimate WhatsApp <br />
          <Box component="span" sx={{ color: 'primary.main' }}>Outreach Platform</Box>
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
          Scale your business communication. Manage contacts, send automated templates, and engage with your customers seamlessly directly from our powerful CRM.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            size="large" 
            color="primary" 
            endIcon={<ArrowForward />} 
            onClick={() => navigate('/dashboard/chat')}
            sx={{ px: 4, py: 1.5, borderRadius: 8, fontSize: '1.1rem' }}
          >
            Start Free Trial
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => navigate('/dashboard/chat')}
            sx={{ px: 4, py: 1.5, borderRadius: 8, fontSize: '1.1rem' }}
          >
            View Demo
          </Button>
        </Box>
      </Container>

      {/* Features Grid */}
      <Box sx={{ bgcolor: 'background.paper', py: 10, flex: 1 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ p: 2, display: 'inline-flex', borderRadius: 2, bgcolor: 'primary.light', color: 'primary.contrastText', mb: 3 }}>
                  <ChatBubbleOutline />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Smart Conversations</Typography>
                <Typography color="text.secondary">Manage all your WhatsApp chats in one unified, collaborative inbox.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ p: 2, display: 'inline-flex', borderRadius: 2, bgcolor: 'info.light', color: 'info.contrastText', mb: 3 }}>
                  <Bolt />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Template Messaging</Typography>
                <Typography color="text.secondary">Create and send pre-approved WhatsApp templates for massive outreach.</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ p: 2, display: 'inline-flex', borderRadius: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText', mb: 3 }}>
                  <PeopleOutline />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Contact Management</Typography>
                <Typography color="text.secondary">Import thousands of contacts via CSV and organize them with tags.</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default Homepage;
