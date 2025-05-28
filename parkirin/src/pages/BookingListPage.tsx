import React from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  Button,
  Chip,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  QrCode,
  AccessTime,
  LocationOn,
  DirectionsCar,
  Payment,
  Cancel,
  Extension,
  Chat
} from '@mui/icons-material';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  GET_MY_ACTIVE_BOOKINGS,
  GET_MY_BOOKING_HISTORY,
  CANCEL_BOOKING,
  EXTEND_BOOKING,
  GENERATE_BOOKING_QR
} from '../apollo/queries';
import { useAuth } from '../contexts/AuthContext';
import type { Booking } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ActiveBookingsData {
  getMyActiveBookings: Booking[];
}

interface BookingHistoryData {
  getMyBookingHistory: Booking[];
}

const BookingListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [extendDuration, setExtendDuration] = React.useState(1);

  // Queries
  const { 
    data: activeBookingsData, 
    loading: activeLoading, 
    error: activeError,
    refetch: refetchActive 
  } = useQuery<ActiveBookingsData>(GET_MY_ACTIVE_BOOKINGS, {
    onCompleted: (data) => {
      console.log('Active bookings data:', data);
    },
    onError: (error: ApolloError) => {
      console.error('Error fetching active bookings:', error);
    }
  });
  
  const { 
    data: historyData, 
    loading: historyLoading, 
    error: historyError,
    refetch: refetchHistory 
  } = useQuery<BookingHistoryData>(GET_MY_BOOKING_HISTORY, {
    onCompleted: (data) => {
      console.log('Booking history data:', data);
    },
    onError: (error: ApolloError) => {
      console.error('Error fetching booking history:', error);
    }
  });

  // Mutations
  const [cancelBooking] = useMutation(CANCEL_BOOKING);
  const [extendBooking] = useMutation(EXTEND_BOOKING);
  const [generateQR] = useMutation(GENERATE_BOOKING_QR);

  const activeBookings = activeBookingsData?.getMyActiveBookings || [];
  const bookingHistory = historyData?.getMyBookingHistory || [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      await cancelBooking({
        variables: { bookingId: selectedBooking._id }
      });
      
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      refetchActive();
      refetchHistory();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error cancelling booking:', error);
        alert(error.message || 'Gagal membatalkan booking');
      }
    }
  };

  const handleExtendBooking = async () => {
    if (!selectedBooking) return;

    try {
      await extendBooking({
        variables: {
          input: {
            bookingId: selectedBooking._id,
            additionalDuration: extendDuration
          }
        }
      });
      
      setExtendDialogOpen(false);
      setSelectedBooking(null);
      refetchActive();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error extending booking:', error);
        alert(error.message || 'Gagal memperpanjang booking');
      }
    }
  };

  const handleGenerateQR = async (booking: Booking) => {
    try {
      const { data } = await generateQR({
        variables: { bookingId: booking._id }
      });
      
      setSelectedBooking({ ...booking, ...data.generateBookingQR });
      setQrDialogOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error generating QR:', error);
        alert(error.message || 'Gagal generate QR code');
      }
    }
  };

  const getStatusColor = (status: string): 'warning' | 'success' | 'info' | 'error' | 'default' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="warning">
            Silakan login untuk melihat daftar booking Anda.
          </Alert>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </Box>
      </Container>
    );
  }

  const isLoading = activeLoading || historyLoading;
  const hasError = activeError || historyError;

  if (hasError) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            Terjadi kesalahan saat memuat data booking.
          </Alert>
        </Box>
      </Container>
    );
  }

  // Tampilkan loading state
  if (activeLoading && tabValue === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (historyLoading && tabValue === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Tampilkan error state
  if (activeError && tabValue === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Terjadi kesalahan saat memuat booking aktif: {(activeError as ApolloError).message}
        </Alert>
      </Box>
    );
  }

  if (historyError && tabValue === 1) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Terjadi kesalahan saat memuat riwayat booking: {(historyError as ApolloError).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Booking Saya
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Booking Aktif" />
            <Tab label="Riwayat Booking" />
          </Tabs>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              {activeBookings.length === 0 ? (
                <Alert severity="info">
                  Anda belum memiliki booking aktif.
                </Alert>
              ) : (
                activeBookings.map((booking) => (
                  <Card key={booking._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ mr: 2 }}>
                              {booking.parkingLot.name}
                            </Typography>
                            <Chip
                              label={getStatusText(booking.status)}
                              color={getStatusColor(booking.status)}
                              size="small"
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography color="text.secondary">
                              {booking.parkingLot.address}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <DirectionsCar sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography color="text.secondary">
                              {booking.vehicleType === 'car' ? 'Mobil' : 'Motor'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography color="text.secondary">
                              {format(new Date(booking.startTime), 'dd MMMM yyyy HH:mm', { locale: id })}
                              {' - '}
                              {format(
                                new Date(new Date(booking.startTime).getTime() + booking.duration * 60 * 60 * 1000),
                                'HH:mm',
                                { locale: id }
                              )}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Payment sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography color="text.secondary">
                              Rp {booking.cost.toLocaleString('id-ID')}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Stack spacing={1}>
                            {booking.status === 'confirmed' && (
                              <>
                                <Button
                                  variant="outlined"
                                  startIcon={<QrCode />}
                                  onClick={() => handleGenerateQR(booking)}
                                  fullWidth
                                >
                                  Lihat QR Code
                                </Button>
                                <Button
                                  variant="outlined"
                                  startIcon={<Extension />}
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setExtendDialogOpen(true);
                                  }}
                                  fullWidth
                                >
                                  Perpanjang
                                </Button>
                              </>
                            )}
                            {booking.status === 'pending' && (
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCancelDialogOpen(true);
                                }}
                                fullWidth
                              >
                                Batalkan
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              startIcon={<Chat />}
                              onClick={() => navigate(`/chat/${booking._id}`)}
                              fullWidth
                            >
                              Chat
                            </Button>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {bookingHistory.length === 0 ? (
                <Alert severity="info">
                  Anda belum memiliki riwayat booking.
                </Alert>
              ) : (
                bookingHistory.map((booking) => (
                  <Card key={booking._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ mr: 2 }}>
                              {booking.parkingLot.name}
                            </Typography>
                            <Chip
                              label={getStatusText(booking.status)}
                              color={getStatusColor(booking.status)}
                              size="small"
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography color="text.secondary">
                              {booking.parkingLot.address}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography color="text.secondary">
                              {format(new Date(booking.startTime), 'dd MMMM yyyy HH:mm', { locale: id })}
                              {' - '}
                              {format(
                                new Date(new Date(booking.startTime).getTime() + booking.duration * 60 * 60 * 1000),
                                'HH:mm',
                                { locale: id }
                              )}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Payment sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography color="text.secondary">
                              Rp {booking.cost.toLocaleString('id-ID')}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabPanel>
          </>
        )}
      </Box>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>QR Code Booking</DialogTitle>
        <DialogContent>
          {selectedBooking?.qrCode && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <img
                src={selectedBooking.qrCode}
                alt="Booking QR Code"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                Tunjukkan QR code ini saat check-in
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* Extend Booking Dialog */}
      <Dialog
        open={extendDialogOpen}
        onClose={() => setExtendDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Perpanjang Durasi Parkir</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Biaya tambahan: Rp{' '}
            {selectedBooking
              ? ((selectedBooking.parkingLot.tariff || 0) *
                  extendDuration
                ).toLocaleString('id-ID')
              : '0'}
            {' '}
            untuk {extendDuration} jam
          </Typography>
          <input
            type="number"
            min="1"
            max="24"
            value={extendDuration}
            onChange={(e) => setExtendDuration(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendDialogOpen(false)}>Batal</Button>
          <Button onClick={handleExtendBooking} variant="contained">
            Perpanjang
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Batalkan Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin membatalkan booking ini?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Tidak</Button>
          <Button onClick={handleCancelBooking} color="error" variant="contained">
            Ya, Batalkan
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingListPage;
