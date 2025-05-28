import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  Chip,
  IconButton,
  Alert,
  Divider,
  Button,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Done as DoneIcon,
  DeleteOutline as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import { GET_NOTIFICATIONS, MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from '../apollo/queries';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Notification } from '../types';

const NotificationsPage: React.FC = () => {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { limit: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ, {
    onCompleted: () => {
      toast.success('Notifikasi ditandai sudah dibaca');
      refetch();
    },
    onError: (error) => {
      toast.error(`Gagal menandai notifikasi: ${error.message}`);
    },
  });

  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ, {
    onCompleted: () => {
      toast.success('Semua notifikasi ditandai sudah dibaca');
      refetch();
    },
    onError: (error) => {
      toast.error(`Gagal menandai semua notifikasi: ${error.message}`);
    },
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({
        variables: { notificationId },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return '🚗';
      case 'payment':
        return '💰';
      case 'chat':
        return '💬';
      case 'system':
        return '🔧';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'primary';
      case 'payment':
        return 'success';
      case 'chat':
        return 'info';
      case 'system':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Gagal memuat notifikasi: {error.message}
        </Alert>
      </Container>
    );
  }

  const notifications: Notification[] = data?.getMyNotifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <NotificationsIcon color="primary" fontSize="large" />
            <Typography variant="h4" component="h1">
              Notifikasi
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} belum dibaca`}
                color="error"
                size="small"
              />
            )}
          </Box>
          
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<MarkReadIcon />}
              onClick={handleMarkAllAsRead}
              size="small"
            >
              Tandai Semua Dibaca
            </Button>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box textAlign="center" py={4}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>
              Belum ada notifikasi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Notifikasi akan muncul di sini ketika ada update terkait booking, pembayaran, atau chat
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <Fade in key={notification._id} timeout={300 + index * 100}>
                <Box>
                  <ListItem
                    sx={{
                      backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 1,
                      border: notification.isRead ? '1px solid transparent' : '1px solid',
                      borderColor: notification.isRead ? 'transparent' : 'primary.light',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: notification.isRead ? 'grey.300' : `${getNotificationColor(notification.type)}.main`,
                          color: 'white',
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={notification.isRead ? 'normal' : 'bold'}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type}
                            size="small"
                            variant="outlined"
                            color={getNotificationColor(notification.type) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontWeight: notification.isRead ? 'normal' : 'medium',
                              mb: 0.5,
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: localeId,
                            })}
                          </Typography>
                        </Box>
                      }
                    />

                    <Box display="flex" alignItems="center" gap={1}>
                      {!notification.isRead && (
                        <IconButton
                          onClick={() => handleMarkAsRead(notification._id)}
                          color="primary"
                          size="small"
                          title="Tandai sudah dibaca"
                        >
                          <CheckIcon />
                        </IconButton>
                      )}
                      {notification.isRead && (
                        <DoneIcon color="success" fontSize="small" />
                      )}
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              </Fade>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage;
