import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      // The AuthContext will automatically pick up the session change,
      // but we can manually trigger the login context if needed or just navigate.
      if (data.session) {
         login(data.session.access_token, data.user);
         navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
      <Paper elevation={1} sx={{ p: { xs: 4, md: 6 }, maxWidth: 450, width: '100%' }}>
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
              required fullWidth label="Email Address" name="email" type="email" 
              value={formData.email} onChange={handleChange} 
            />
            <TextField 
              required fullWidth label="Password" name="password" type="password" 
              value={formData.password} onChange={handleChange} 
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
