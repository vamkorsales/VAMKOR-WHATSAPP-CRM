import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Grid, Alert, MenuItem } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Sample list of countries for the dropdown
const countries = [
  'United States', 'United Kingdom', 'India', 'United Arab Emirates', 'Canada', 'Australia', 'Germany', 'France', 'Other'
];

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '',
    companyName: '',
    country: '',
    customCountry: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      const finalCountry = formData.country === 'Other' ? formData.customCountry : formData.country;

      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        contactNumber: formData.contactNumber,
        companyName: formData.companyName,
        country: finalCountry,
        password: formData.password
      });

      // Automatically log the user in after successful registration
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: 2
    }}>
      <Paper elevation={1} sx={{ p: { xs: 4, md: 6 }, maxWidth: 800, width: '100%' }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom color="primary">
          Vamkor CRM
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Create your account to supercharge your WhatsApp outreach.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Create Username" name="username" value={formData.username} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Email ID" name="email" type="email" value={formData.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={formData.country === 'Other' ? 6 : 12}>
              <TextField required select fullWidth label="Country of Business" name="country" value={formData.country} onChange={handleChange}>
                {countries.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {formData.country === 'Other' && (
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth label="Specify Country" name="customCountry" value={formData.customCountry} onChange={handleChange} />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Create Password" name="password" type="password" value={formData.password} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
            </Grid>
          </Grid>

          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 5, mb: 2, py: 1.5 }}>
            Create Account
          </Button>
          
          <Typography textAlign="center" color="text.secondary">
            Already have an account? <RouterLink to="/login" style={{ color: '#10B981', textDecoration: 'none' }}>Log in here</RouterLink>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}

export default Signup;
