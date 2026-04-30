import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
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
      <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, maxWidth: 450, width: '100%' }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom color="primary">
          Welcome Back
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Log in to continue to your dashboard.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField 
              required 
              fullWidth 
              label="Email Address" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
            />
            <TextField 
              required 
              fullWidth 
              label="Password" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
            />
            
            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 2, py: 1.5 }}>
              Log In
            </Button>
            
            <Typography textAlign="center" color="text.secondary">
              Don't have an account? <RouterLink to="/signup" style={{ color: '#10B981', textDecoration: 'none' }}>Sign up here</RouterLink>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default Login;
