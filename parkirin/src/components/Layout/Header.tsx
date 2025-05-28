import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Person,
  AccountBalanceWallet,
  DirectionsCar,
  History,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/helpers';

interface HeaderProps {
  onNotificationsClick: () => void;
  unreadNotifications: number;
}

const Header: React.FC<HeaderProps> = ({
  onNotificationsClick,
  unreadNotifications,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const isMenuOpen = Boolean(anchorEl);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold' }}
        >
          ParkirCepat
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Saldo */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              px: 2,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <AccountBalanceWallet fontSize="small" />
            <Typography variant="body2" fontWeight="medium">
              {formatCurrency(user.saldo)}
            </Typography>
          </Box>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={onNotificationsClick}
            aria-label="notifications"
          >
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            aria-label="account menu"
          >
            {user.avatar ? (
              <Avatar
                src={user.avatar}
                alt={user.name}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
            },
          }}
        >
          {/* User Info */}
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" color="text.primary">
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
            {user.role !== 'user' && (
              <Typography
                variant="caption"
                color="primary"
                sx={{ textTransform: 'capitalize' }}
              >
                {user.role}
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Menu Items */}
          <MenuItem onClick={() => window.location.href = '/profile'}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profil</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => window.location.href = '/wallet'}>
            <ListItemIcon>
              <AccountBalanceWallet fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              Saldo ({formatCurrency(user.saldo)})
            </ListItemText>
          </MenuItem>

          <MenuItem onClick={() => window.location.href = '/topup'}>
            <ListItemIcon>
              <AccountBalanceWallet fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              Top Up Saldo
            </ListItemText>
          </MenuItem>

          {user.role === 'user' && (
            <MenuItem onClick={() => window.location.href = '/bookings'}>
              <ListItemIcon>
                <DirectionsCar fontSize="small" />
              </ListItemIcon>
              <ListItemText>Booking Saya</ListItemText>
            </MenuItem>
          )}

          {user.role === 'landowner' && (
            <MenuItem onClick={() => window.location.href = '/my-parking-lots'}>
              <ListItemIcon>
                <DirectionsCar fontSize="small" />
              </ListItemIcon>
              <ListItemText>Tempat Parkir Saya</ListItemText>
            </MenuItem>
          )}

          <MenuItem onClick={() => window.location.href = '/history'}>
            <ListItemIcon>
              <History fontSize="small" />
            </ListItemIcon>
            <ListItemText>Riwayat</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => window.location.href = '/settings'}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Pengaturan</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>Keluar</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
