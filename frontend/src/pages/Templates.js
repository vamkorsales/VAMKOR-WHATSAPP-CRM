import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Button, Paper, Grid, Card, CardContent, Chip, 
  TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Add, CheckCircleOutline, AccessTime } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', category: 'MARKETING', content: '' });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/templates`);
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/templates`, newTemplate);
      setIsCreating(false);
      setNewTemplate({ name: '', category: 'MARKETING', content: '' });
      fetchTemplates();
    } catch (err) {
      console.error('Failed to create template:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Message Templates</Typography>
        <Button 
          variant={isCreating ? "outlined" : "contained"} 
          startIcon={isCreating ? null : <Add />}
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? 'Cancel' : 'Create Template'}
        </Button>
      </Box>

      {isCreating && (
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'primary.light', bgcolor: '#F0FDF4' }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">Create New Template</Typography>
          <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2, maxWidth: 600 }}>
            
            <TextField
              label="Template Name"
              required
              fullWidth
              placeholder="e.g. holiday_promo_1"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
              sx={{ bgcolor: 'background.paper' }}
            />
            
            <FormControl fullWidth sx={{ bgcolor: 'background.paper' }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newTemplate.category}
                label="Category"
                onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
              >
                <MenuItem value="MARKETING">Marketing</MenuItem>
                <MenuItem value="UTILITY">Utility</MenuItem>
                <MenuItem value="AUTHENTICATION">Authentication</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Message Content (use {{1}} for variables)"
              required
              multiline
              rows={4}
              placeholder="Hi {{1}}, here is your discount code: {{2}}"
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
              sx={{ bgcolor: 'background.paper' }}
            />
            
            <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
              Submit for Approval
            </Button>
          </Box>
        </Paper>
      )}

      <Grid container spacing={3}>
        {templates.map(template => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" fontWeight="bold">{template.name}</Typography>
                  <Chip 
                    icon={template.status === 'APPROVED' ? <CheckCircleOutline fontSize="small" /> : <AccessTime fontSize="small" />}
                    label={template.status} 
                    color={template.status === 'APPROVED' ? 'success' : 'warning'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Box>
                  <Chip label={template.category} size="small" color="primary" sx={{ bgcolor: 'primary.light', color: 'primary.dark', border: 'none' }} />
                </Box>
                <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'background.default', borderRadius: 1, color: 'text.secondary', flex: 1 }}>
                  {template.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Templates;
