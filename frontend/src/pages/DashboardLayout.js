import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Typography, AppBar, Toolbar, Divider, IconButton
} from '@mui/material';
import Message from '@mui/icons-material/Message';
import People from '@mui/icons-material/People';
import Description from '@mui/icons-material/Description';
import SettingsInputComponent from '@mui/icons-material/SettingsInputComponent';
import Settings from '@mui/icons-material/Settings';
import ExitToApp from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import Dashboard from '@mui/icons-material/Dashboard';
import Campaign from '@mui/icons-material/Campaign';
import BarChart from '@mui/icons-material/BarChart';

const drawerWidth = 280;

function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { path: '/dashboard/overview', icon: <Dashboard />, label: 'Overview' },
    { path: '/dashboard/chat', icon: <Message />, label: 'Conversations' },
    { path: '/dashboard/contacts', icon: <People />, label: 'Contacts' },
    { path: '/dashboard/templates', icon: <Description />, label: 'Templates' },
    { path: '/dashboard/campaigns', icon: <Campaign />, label: 'Campaigns' },
    { path: '/dashboard/analytics', icon: <BarChart />, label: 'Analytics' },
    { path: '/dashboard/integration', icon: <SettingsInputComponent />, label: 'Integration' },
    { path: '/dashboard/settings', icon: <Settings />, label: 'Settings' },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Message color="primary" />
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Vamkor CRM
        </Typography>
      </Box>
      
      <List sx={{ px: 2, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                component={NavLink} 
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.light' : 'action.hover',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider />
      <List sx={{ px: 2, pb: 2, pt: 2 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/')} sx={{ borderRadius: 2, color: 'text.secondary' }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Exit Dashboard" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      {/* Mobile AppBar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          display: { sm: 'none' }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {navItems.find(i => location.pathname.includes(i.path))?.label || 'Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          mt: { xs: 8, sm: 0 }
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: { xs: 'none', sm: 'block' }, mb: 4 }}>
          {navItems.find(i => location.pathname.includes(i.path))?.label || 'Dashboard'}
        </Typography>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
