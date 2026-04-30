import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const AuthGuard = ({ component: Component, ...args }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Component {...args} />;
};
