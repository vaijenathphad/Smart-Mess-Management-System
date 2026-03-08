import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Student Dashboard';
    if (path === '/students') return 'Student Management';
    if (path === '/menu') return 'Menu Management';
    if (path === '/daily-menu') return 'Daily Menu';
    if (path === '/attendance') return 'Attendance Management';
    if (path === '/notifications') return 'Notifications & Reminders';
    return 'Mess Management System';
  };

  // Define menu items based on user role
  const menuItems = user?.isAdmin
    ? [
        { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { text: 'Student Management', path: '/students', icon: <SchoolIcon /> },
        { text: 'Menu Management', path: '/menu', icon: <RestaurantIcon /> },
        { text: 'Daily Menu', path: '/daily-menu', icon: <RestaurantIcon /> },
        { text: 'Attendance Management', path: '/attendance', icon: <CalendarIcon /> },
        { text: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
      ]
    : [
        { text: 'Student Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { text: 'Daily Menu', path: '/daily-menu', icon: <RestaurantIcon /> },
        { text: 'My Attendance', path: '/attendance', icon: <CalendarIcon /> },
        { text: 'My Payments', path: '/payments', icon: <PaymentIcon /> },
      ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          height: 120
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            Mess Management
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {user?.isAdmin ? 'Admin Portal' : 'Student Portal'}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiListItemText-primary': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1.5, 
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            cursor: 'pointer',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }
          }}
          onClick={handleLogout}
        >
          <LogoutIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
          <Typography variant="body2" color="primary" fontWeight={500}>
            Logout
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {getPageTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="notifications"
              color="inherit"
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }
              }}
              onClick={handleProfileMenuOpen}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: theme.palette.primary.main,
                  mr: 1
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={500}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.isAdmin ? 'Admin' : 'Student'}
                </Typography>
              </Box>
            </Box>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { 
                  mt: 1.5, 
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 