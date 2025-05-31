import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LocalParking as ParkingIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as MotorcycleIcon,
} from '@mui/icons-material';
import { useQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { formatDistanceToNow, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import { GET_MY_PARKING_LOTS, GET_PARKING_LOT_BOOKINGS } from '../apollo/queries';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ParkingLot, Booking } from '../types';

const LandownerDashboardPage: React.FC = () => {
  const [selectedParkingLot, setSelectedParkingLot] = useState<string>('');

  const { data: parkingLotsData, loading: parkingLotsLoading, error: parkingLotsError } = useQuery(GET_MY_PARKING_LOTS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: bookingsData, loading: bookingsLoading, error: bookingsError } = useQuery(GET_PARKING_LOT_BOOKINGS, {
    variables: { parkingLotId: selectedParkingLot },
    skip: !selectedParkingLot,
    fetchPolicy: 'cache-and-network',
  });

  const parkingLots: ParkingLot[] = parkingLotsData?.getMyParkingLots || [];
  const bookings: Booking[] = bookingsData?.getParkingLotBookings || [];

  // Calculate statistics
  const totalSlots = parkingLots.reduce((sum, lot) => sum + (lot.capacity?.car || 0) + (lot.capacity?.motorcycle || 0), 0);
  const totalAvailable = parkingLots.reduce((sum, lot) => sum + (lot.available?.car || 0) + (lot.available?.motorcycle || 0), 0);
  const occupancyRate = totalSlots > 0 ? ((totalSlots - totalAvailable) / totalSlots * 100) : 0;
  
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  });

  const monthlyRevenue = bookings
    .filter(booking => {
      const bookingDate = new Date(booking.startTime);
      const currentMonth = new Date();
      return bookingDate.getMonth() === currentMonth.getMonth() && 
             bookingDate.getFullYear() === currentMonth.getFullYear() &&
             booking.status === 'completed';
    })
    .reduce((sum, booking) => sum + booking.cost, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    return vehicleType === 'car' ? <CarIcon /> : <MotorcycleIcon />;
  };

  if (parkingLotsLoading) return <LoadingSpinner />;

  if (parkingLotsError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Gagal memuat data tempat parkir: {parkingLotsError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={500}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <DashboardIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                Dashboard Pemilik Lahan
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Kelola tempat parkir dan pantau performa bisnis Anda
              </Typography>
            </Box>
          </Box>

          {parkingLots.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              Anda belum memiliki tempat parkir. 
              <Button variant="text" href="/landowner/parking-lots" sx={{ ml: 1 }}>
                Buat tempat parkir pertama Anda
              </Button>
            </Alert>
          ) : (
            <>              {/* Statistics Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom variant="body2">
                            Total Tempat Parkir
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {parkingLots.length}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <ParkingIcon />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom variant="body2">
                            Tingkat Okupansi
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {occupancyRate.toFixed(1)}%
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <TrendingUpIcon />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom variant="body2">
                            Booking Hari Ini
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {todayBookings.length}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <PeopleIcon />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom variant="body2">
                            Pendapatan Bulan Ini
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            Rp {monthlyRevenue.toLocaleString('id-ID')}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <MoneyIcon />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Parking Lot Selector */}
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Detail Booking per Tempat Parkir
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Pilih Tempat Parkir</InputLabel>
                  <Select
                    value={selectedParkingLot}
                    label="Pilih Tempat Parkir"
                    onChange={(e) => setSelectedParkingLot(e.target.value)}
                  >
                    {parkingLots.map((lot) => (
                      <MenuItem key={lot._id} value={lot._id}>
                        {lot.name} - {lot.address}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Bookings List */}
                {selectedParkingLot && (
                  <Box>
                    {bookingsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : bookingsError ? (
                      <Alert severity="error">
                        Gagal memuat data booking: {bookingsError.message}
                      </Alert>
                    ) : bookings.length === 0 ? (
                      <Alert severity="info">
                        Belum ada booking untuk tempat parkir ini.
                      </Alert>
                    ) : (
                      <List>
                        {bookings.slice(0, 10).map((booking, index) => (
                          <React.Fragment key={booking._id}>
                            {index > 0 && <Divider />}
                            <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar src={booking.user.avatar} alt={booking.user.name}>
                                  {booking.user.name.charAt(0).toUpperCase()}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                      {booking.user.name}
                                    </Typography>                                    <Chip 
                                      size="small" 
                                      label={booking.status} 
                                      color={getStatusColor(booking.status)}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      {getVehicleIcon(booking.vehicleType)}
                                      <Typography variant="body2" color="text.secondary">
                                        {booking.vehicleType === 'car' ? 'Mobil' : 'Motor'}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <ScheduleIcon fontSize="small" />
                                      <Typography variant="body2" color="text.secondary">
                                        {format(new Date(booking.startTime), 'dd MMM yyyy, HH:mm', { locale: localeId })} 
                                        ({booking.duration} jam)
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <MoneyIcon fontSize="small" />
                                      <Typography variant="body2" color="text.secondary">
                                        Rp {booking.cost.toLocaleString('id-ID')}
                                      </Typography>
                                      {booking.payment && (
                                        <Chip 
                                          size="small" 
                                          label={booking.payment.status}
                                          variant="outlined"
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                }
                              />
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDistanceToNow(new Date(booking.createdAt), { 
                                    addSuffix: true, 
                                    locale: localeId 
                                  })}
                                </Typography>
                              </Box>
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </Paper>              {/* Quick Actions */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Aksi Cepat
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<ParkingIcon />}
                      href="/landowner/parking-lots"
                    >
                      Kelola Tempat Parkir
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<MoneyIcon />}
                      onClick={() => toast.info('Fitur laporan akan segera hadir')}
                    >
                      Lihat Laporan
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<TrendingUpIcon />}
                      onClick={() => toast.info('Fitur analitik akan segera hadir')}
                    >
                      Analitik
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default LandownerDashboardPage;
