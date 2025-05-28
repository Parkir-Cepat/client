// filepath: e:\Latihan-Coding\Hacktiv8\phase3\FINAL PROJECT\client\parkirin\src\components\Header.tsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  DirectionsCar,
  Search,
  BookmarkBorder,
  Chat,
  Dashboard,
  Business,
  Logout,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { text: 'Beranda', path: '/', icon: <DirectionsCar /> },
    { text: 'Cari Parkir', path: '/search', icon: <Search /> },
  ];

  const authenticatedItems = [
    { text: 'Booking Saya', path: '/bookings', icon: <BookmarkBorder /> },
    { text: 'Chat', path: '/chat', icon: <Chat /> },
    { text: 'Notifikasi', path: '/notifications', icon: <Notifications /> },
  ];

  const landownerItems = [
    { text: 'Dashboard', path: '/landowner/dashboard', icon: <Dashboard /> },
    { text: 'Kelola Parkir', path: '/landowner/parking-lots', icon: <Business /> },
  ];

  const renderMobileMenu = () => (
    <Drawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={toggleMobileMenu}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 250,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          ParkirCepat
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            onClick={toggleMobileMenu}
            sx={{
              color: location.pathname === item.path ? 'primary.main' : 'inherit',
              backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            {authenticatedItems.map((item) => (
              <ListItem
                key={item.text}
                component={Link}
                to={item.path}
                onClick={toggleMobileMenu}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            {user?.role === 'landowner' && (
              <>
                <Divider sx={{ my: 1 }} />
                {landownerItems.map((item) => (
                  <ListItem
                    key={item.text}
                    component={Link}
                    to={item.path}
                    onClick={toggleMobileMenu}
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'inherit',
                      backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </>
            )}
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleMobileMenu}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              mr: 4,
            }}
          >
            ParkirCepat
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: location.pathname === item.path ? 'secondary.main' : 'inherit',
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                {!isMobile && (
                  <>
                    <IconButton color="inherit" component={Link} to="/notifications">
                      <Badge badgeContent={0} color="secondary">
                        <Notifications />
                      </Badge>
                    </IconButton>
                    <IconButton color="inherit" component={Link} to="/chat">
                      <Chat />
                    </IconButton>
                  </>
                )}
                
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {user?.profilePicture ? (
                    <Avatar src={user.profilePicture} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                <Menu
                  id="menu-appbar"
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
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose} component={Link} to="/profile">
                    <ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    Profil
                  </MenuItem>
                  {user?.role === 'landowner' && !isMobile && (
                    [
                      <MenuItem key="dashboard" onClick={handleClose} component={Link} to="/landowner/dashboard">
                        <ListItemIcon>
                          <Dashboard fontSize="small" />
                        </ListItemIcon>
                        Dashboard
                      </MenuItem>,
                      <MenuItem key="manage" onClick={handleClose} component={Link} to="/landowner/parking-lots">
                        <ListItemIcon>
                          <Business fontSize="small" />
                        </ListItemIcon>
                        Kelola Parkir
                      </MenuItem>
                    ]
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button color="inherit" component={Link} to="/login">
                  Masuk
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'white',
                    },
                  }}
                  component={Link}
                  to="/register"
                >
                  Daftar
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu()}
    </>
  );
};

export default Header;