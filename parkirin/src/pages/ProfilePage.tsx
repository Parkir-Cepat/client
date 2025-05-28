// filepath: e:\Latihan-Coding\Hacktiv8\phase3\FINAL PROJECT\client\parkirin\src\pages\ProfilePage.tsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  IconButton,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Phone,
  Email,
  LocationOn,
  AccountCircle,
  History,
  Settings,
  Security,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';

import { UPDATE_PROFILE, GET_MY_ACTIVE_BOOKINGS } from '../apollo/queries';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import type { UpdateProfileInput, Booking } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const [updateProfile, { loading: updateLoading }] = useMutation(UPDATE_PROFILE);

  const { data: bookingsData, loading: bookingsLoading } = useQuery(GET_MY_ACTIVE_BOOKINGS, {
    variables: { limit: 5 },
    skip: tabValue !== 1,
  });

  const validationSchema = Yup.object({
    name: Yup.string().required('Nama wajib diisi'),
    email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
    phone: Yup.string(),
    address: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const input: UpdateProfileInput = {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          address: values.address || undefined,
        };        await updateProfile({
          variables: { input },
        });

        // await refetchUser();
        setIsEditing(false);        toast.success('Profil berhasil diperbarui');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui profil';
        toast.error(errorMessage);
      }
    },
  });
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      formik.resetForm();
    }
    setIsEditing(!isEditing);
  };
  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement image upload to Cloudinary
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'primary';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif';
      case 'COMPLETED':
        return 'Selesai';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  if (!user) {
    return <LoadingSpinner message="Memuat profil..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profil Saya
      </Typography>      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                src={user.profilePicture}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              >
                <AccountCircle sx={{ fontSize: 80 }} />
              </Avatar>
              {isEditing && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  <PhotoCamera />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </IconButton>
              )}
            </Box>
            <Typography variant="h6" gutterBottom>
              {user.name}
            </Typography>
            <Chip
              label={user.role === 'landowner' ? 'Pemilik Lahan' : 'Pengguna'}
              color="primary"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Bergabung sejak {formatDate(user.createdAt)}
            </Typography>
          </Paper>
        </Grid>        <Grid size={{ xs: 12, md: 8 }}>
          <Paper>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Informasi Profil" icon={<AccountCircle />} />
                <Tab label="Riwayat Booking" icon={<History />} />
                <Tab label="Pengaturan" icon={<Settings />} />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Informasi Personal</Typography>
                <Box>
                  {isEditing ? (
                    <>
                      <Button
                        startIcon={<Save />}
                        onClick={formik.submitForm}
                        disabled={updateLoading}
                        sx={{ mr: 1 }}
                      >
                        Simpan
                      </Button>
                      <Button
                        startIcon={<Cancel />}
                        variant="outlined"
                        onClick={handleEditToggle}
                      >
                        Batal
                      </Button>
                    </>
                  ) : (
                    <Button startIcon={<Edit />} onClick={handleEditToggle}>
                      Edit Profil
                    </Button>
                  )}
                </Box>
              </Box>

              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Nama"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <AccountCircle sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Nomor Telepon"
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Alamat"
                      name="address"
                      multiline
                      rows={3}
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.address && Boolean(formik.errors.address)}
                      helperText={formik.touched.address && formik.errors.address}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />,
                      }}
                    />
                  </Grid>
                </Grid>
              </form>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Riwayat Booking Terbaru
              </Typography>
              
              {bookingsLoading ? (
                <LoadingSpinner message="Memuat riwayat booking..." />
              ) : bookingsData?.myBookings?.bookings?.length > 0 ? (
                <List>
                  {bookingsData.myBookings.bookings.map((booking: Booking, index: number) => (
                    <React.Fragment key={booking.id}>
                      <ListItem>
                        <ListItemText
                          primary={booking.parkingLot.name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Rp {booking.totalAmount.toLocaleString('id-ID')}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={getStatusLabel(booking.status)}
                            color={getStatusColor(booking.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < bookingsData.myBookings.bookings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  Belum ada riwayat booking. Mulai cari tempat parkir sekarang!
                </Alert>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Pengaturan Akun
              </Typography>
              
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Security sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6">Keamanan</Typography>
                  </Box>
                  <Button variant="outlined" fullWidth>
                    Ubah Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" color="error" gutterBottom>
                    Zona Bahaya
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun Anda secara permanen.
                  </Typography>
                  <Button variant="outlined" color="error">
                    Hapus Akun
                  </Button>
                </CardContent>
              </Card>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;