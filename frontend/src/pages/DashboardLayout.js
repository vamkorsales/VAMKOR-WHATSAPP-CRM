import React from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, AppBar, Toolbar, Divider, IconButton, Avatar, Menu, MenuItem, Tooltip, Chip
} from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupsIcon from '@mui/icons-material/Groups';
import PaymentIcon from '@mui/icons-material/Payment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useAuth } from '../AuthContext';

const drawerWidth = 256;

// Sidebar nav sections
const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard/overview', color: '#4F46E5' },
      { text: 'Conversations', icon: <MessageIcon />, path: '/dashboard/chat', color: '#059669' },
      { text: 'Contacts', icon: <PeopleIcon />, path: '/dashboard/contacts', color: '#2563EB' },
      { text: 'Templates', icon: <DescriptionIcon />, path: '/dashboard/templates', color: '#7C3AED' },
      { text: 'Campaigns', icon: <CampaignIcon />, path: '/dashboard/campaigns', color: '#D97706' },
    ]
  },
  {
    label: 'Manage',
    adminOnly: true,
    items: [
      { text: 'Integration', icon: <SettingsInputComponentIcon />, path: '/dashboard/integration', color: '#0891B2' },
      { text: 'Team', icon: <GroupsIcon />, path: '/dashboard/team', color: '#7C3AED' },
      { text: 'Billing', icon: <PaymentIcon />, path: '/dashboard/billing', color: '#059669' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings', color: '#64748B' },
    ]
  }
];

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const displayName = user?.user_metadata?.username || user?.user_metadata?.name || user?.email || 'User';
  const displayInitial = displayName.charAt(0).toUpperCase();
  const roleLabel = (user?.role || 'Agent').replace('_', ' ');

  const handleLogout = () => { logout(); navigate('/login'); };

  // All nav items flattened for title detection
  const allItems = NAV_SECTIONS.flatMap(s => s.items);
  const currentItem = allItems.find(i => location.pathname.includes(i.path));
  const pageTitle = isSuperAdmin && location.pathname.includes('super-admin')
    ? 'Super Admin'
    : currentItem?.text || 'Dashboard';

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const drawer = (
    <Box sx={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
      color: 'white'
    }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <WhatsAppIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white', lineHeight: 1.2 }}>
            Vamkor CRM
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
            WhatsApp Business Suite
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* Nav Sections */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1.5 }}>
        {NAV_SECTIONS.filter(s => !s.adminOnly || isAdmin).map((section) => (
          <Box key={section.label} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{
              px: 3, color: 'rgba(255,255,255,0.3)', fontWeight: 700,
              letterSpacing: 1, fontSize: 10, textTransform: 'uppercase', display: 'block', mb: 0.5
            }}>
              {section.label}
            </Typography>
            <List disablePadding sx={{ px: 1.5 }}>
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      sx={{
                        borderRadius: 2,
                        py: 1,
                        color: active ? 'white' : 'rgba(255,255,255,0.55)',
                        bgcolor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', color: 'white' },
                        transition: 'all 0.15s',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box sx={{
                          width: 28, height: 28, borderRadius: 1.5,
                          bgcolor: active ? item.color : 'rgba(255,255,255,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}>
                          {React.cloneElement(item.icon, { sx: { fontSize: 16, color: active ? 'white' : 'rgba(255,255,255,0.5)' } })}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: 14 }}
                      />
                      {active && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'white', ml: 0.5 }} />}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}

        {isSuperAdmin && (
          <Box sx={{ px: 1.5 }}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard/super-admin"
                sx={{
                  borderRadius: 2, py: 1,
                  color: isActive('/dashboard/super-admin') ? 'white' : 'rgba(255,255,255,0.55)',
                  bgcolor: isActive('/dashboard/super-admin') ? 'rgba(239,68,68,0.15)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: 'white' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AdminPanelSettingsIcon sx={{ fontSize: 16, color: 'white' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText primary="Super Admin" primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
              </ListItemButton>
            </ListItem>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* User Profile Panel at Bottom */}
      <Box sx={{ p: 2 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)',
          cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
        }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#4F46E5', fontSize: 14, fontWeight: 700 }}>
            {displayInitial}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: 'white', lineHeight: 1.2 }} noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'capitalize' }}>
              {roleLabel.toLowerCase()}
            </Typography>
          </Box>
          <Tooltip title="Log Out">
            <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#EF4444' } }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
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
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
            {pageTitle}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 'none' } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 'none' } }}
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
          display: 'flex', flexDirection: 'column',
          bgcolor: '#F8FAFC',
          mt: { xs: 8, sm: 0 },
          overflow: 'hidden'
        }}
      >
        {/* Top Header Bar */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#0F172A">{pageTitle}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          {/* Right: User Info + Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#0F172A">{displayName}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {roleLabel.toLowerCase()}
              </Typography>
            </Box>
            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ p: 0 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#4F46E5', fontWeight: 700 }}>{displayInitial}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              onClick={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight="bold">{displayName}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => navigate('/dashboard/settings')}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                Profile Details
              </MenuItem>
              <MenuItem onClick={() => navigate('/dashboard/settings')}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                Log Out
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
