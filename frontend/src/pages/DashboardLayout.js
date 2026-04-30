import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
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
import AnalyticsIcon from '@mui/icons-material/Analytics';
import GroupsIcon from '@mui/icons-material/Groups';
import PaymentIcon from '@mui/icons-material/Payment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../AuthContext';

const drawerWidth = 260;

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Base items for agents
  let menuItems = [
    { text: 'Overview', icon: <Dashboard />, path: '/dashboard/overview' },
    { text: 'Conversations', icon: <Message />, path: '/dashboard/chat' },
    { text: 'Contacts', icon: <People />, path: '/dashboard/contacts' },
    { text: 'Templates', icon: <Description />, path: '/dashboard/templates' },
    { text: 'Campaigns', icon: <Campaign />, path: '/dashboard/campaigns' },
  ];

  // Admin gets extra tools
  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    menuItems.push(
      { text: 'Integration', icon: <SettingsInputComponent />, path: '/dashboard/integration' },
      { text: 'Team', icon: <GroupsIcon />, path: '/dashboard/team' },
      { text: 'Billing', icon: <PaymentIcon />, path: '/dashboard/billing' },
      { text: 'Settings', icon: <Settings />, path: '/dashboard/settings' }
    );
  }

  // Super Admin gets a dedicated view
  if (user?.role === 'SUPER_ADMIN') {
    menuItems.unshift({ text: 'Super Admin', icon: <AdminPanelSettingsIcon />, path: '/dashboard/super-admin' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Message color="primary" />
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Vamkor CRM
        </Typography>
      </Box>
      
      <List sx={{ px: 2, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: '8px',
                '&.Mui-selected': {
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10B981',
                  '& .MuiListItemIcon-root': {
                    color: '#10B981',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#10B981' : 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
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
            {menuItems.find(i => location.pathname.includes(i.path))?.text || 'Dashboard'}
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
          {menuItems.find(i => location.pathname.includes(i.path))?.text || 'Dashboard'}
        </Typography>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
