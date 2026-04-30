import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const AuthGuard = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Redirecting to login...</Typography>
      </Box>
    ),
    ...args,
  });

  return <Component />;
};
