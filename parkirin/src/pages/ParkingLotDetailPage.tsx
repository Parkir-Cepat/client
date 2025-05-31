// filepath: e:\Latihan-Coding\Hacktiv8\phase3\FINAL PROJECT\client\parkirin\src\pages\ParkingLotDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PARKING_LOT_DETAILS, CREATE_BOOKING } from '../apollo/queries';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Rating,
  TextField,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface CreateBookingInput {
  parkingLotId: string;
  vehicleType: 'car' | 'motorcycle';
  startTime: string;
  duration: number;
}

const ParkingLotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();  const navigate = useNavigate();
  const { user } = useAuth();
  // const [isFavorite, setIsFavorite] = useState(false); // Future feature
  const [bookingInput, setBookingInput] = useState<CreateBookingInput>({
    parkingLotId: id || '',
    vehicleType: 'car',
    startTime: new Date().toISOString(),
    duration: 1,
  });
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const { data: parkingLotData, loading: parkingLotLoading, error } = useQuery(GET_PARKING_LOT_DETAILS, {
    variables: { id },
    skip: !id,
  });

  const [createBooking, { loading: bookingLoading }] = useMutation(CREATE_BOOKING, {
    onCompleted: (data) => {
      navigate(`/bookings/${data.createBooking._id}`);
    },
    onError: (error) => {
      setBookingError(error.message);
    },
  });
  // Future feature: Book now functionality
  // const handleBookNow = () => {
  //   if (!user) {
  //     toast.error('Silakan login terlebih dahulu');
  //     navigate('/login');
  //     return;
  //   }
  //   setIsBookingDialogOpen(true);
  // };

  // Future feature: Share functionality
  // const handleShare = () => {
  //   if (navigator.share) {
  //     navigator.share({
  //       title: parkingLotData?.getParkingLot.name,
  //       text: `Cek tempat parkir ${parkingLotData?.getParkingLot.name} di ParkirCepat`,
  //       url: window.location.href,
  //     });
  //   } else {
  //     navigator.clipboard.writeText(window.location.href);
  //     toast.success('Link berhasil disalin');
  //   }
  // };

  // Future feature: Favorite functionality
  // const toggleFavorite = () => {
  //   if (!user) {
  //     toast.error('Silakan login terlebih dahulu');
  //     return;
  //   }
  //   setIsFavorite(!isFavorite);
  //   toast.success(isFavorite ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit');
  // };

  const handleBooking = async () => {
    try {
      await createBooking({
        variables: {
          input: bookingInput,
        },
      });
    } catch (err) {
      console.error('Booking error:', err);
    }
  };
  useEffect(() => {
    if (parkingLotData?.getParkingLot) {
      // Future feature: setIsFavorite(parkingLotData.getParkingLot.isFavorite);
    }
  }, [parkingLotData]);

  if (parkingLotLoading) {
    return <LoadingSpinner message="Memuat detail tempat parkir..." />;
  }

  if (error || !parkingLotData?.getParkingLot) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Tempat parkir tidak ditemukan atau terjadi kesalahan.</Alert>
      </Container>
    );
  }

  const parkingLot = parkingLotData.getParkingLot;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>      <Grid container spacing={4}>
        {/* Left column - Images and Info */}
        <Grid container size={{ xs: 12, md: 8 }} spacing={2}>
          {/* Images */}
          <Grid size={{ xs: 12 }}>
            <img
              src={parkingLot.images[0] || '/default-parking.jpg'}
              alt={parkingLot.name}
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </Grid>

          {/* Main info */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                {parkingLot.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={parkingLot.rating} readOnly precision={0.5} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({parkingLot.reviewCount} reviews)
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                {parkingLot.address}
              </Typography>
            </Box>

            {/* Facilities */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Fasilitas
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {parkingLot.facilities.map((facility: string) => (
                  <Chip key={facility} label={facility} />
                ))}
              </Box>
            </Box>

            {/* Operating Hours */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Jam Operasional
              </Typography>
              <Typography>
                {parkingLot.operationalHours.open} - {parkingLot.operationalHours.close}
              </Typography>
            </Box>
          </Grid>
        </Grid>        {/* Right column - Booking Form */}
        <Grid container size={{ xs: 12, md: 4 }}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Book Now
                </Typography>

                {/* Rates */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Tarif:</Typography>
                  <Typography>Mobil: Rp {parkingLot.rates.car}/jam</Typography>
                  <Typography>Motor: Rp {parkingLot.rates.motorcycle}/jam</Typography>
                </Box>

                {/* Available slots */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">Slot Tersedia:</Typography>
                  <Typography>Mobil: {parkingLot.available.car}</Typography>
                  <Typography>Motor: {parkingLot.available.motorcycle}</Typography>
                </Box>

                {user ? (
                  <Box>
                    <TextField
                      select
                      fullWidth
                      label="Tipe Kendaraan"
                      value={bookingInput.vehicleType}
                      onChange={(e) =>
                        setBookingInput({
                          ...bookingInput,
                          vehicleType: e.target.value as 'car' | 'motorcycle',
                        })
                      }
                      sx={{ mb: 2 }}
                    >
                      <MenuItem value="car">Mobil</MenuItem>
                      <MenuItem value="motorcycle">Motor</MenuItem>
                    </TextField>

                    <TextField
                      type="datetime-local"
                      fullWidth
                      label="Waktu Mulai"
                      value={bookingInput.startTime.split('.')[0]}
                      onChange={(e) =>
                        setBookingInput({
                          ...bookingInput,
                          startTime: new Date(e.target.value).toISOString(),
                        })
                      }
                      sx={{ mb: 2 }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />

                    <TextField
                      type="number"
                      fullWidth
                      label="Durasi (jam)"
                      value={bookingInput.duration}
                      onChange={(e) =>
                        setBookingInput({
                          ...bookingInput,
                          duration: parseInt(e.target.value),
                        })
                      }
                      inputProps={{ min: 1, max: 24 }}
                      sx={{ mb: 2 }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => setIsBookingDialogOpen(true)}
                      disabled={bookingLoading}
                    >
                      Pesan Sekarang
                    </Button>
                  </Box>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate('/login')}
                  >
                    Login untuk Memesan
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Booking Confirmation Dialog */}
      <Dialog
        open={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Konfirmasi Pemesanan</DialogTitle>
        <DialogContent>
          <Typography paragraph>Silakan konfirmasi detail pemesanan Anda:</Typography>
          <Typography>
            Tipe Kendaraan: {bookingInput.vehicleType === 'car' ? 'Mobil' : 'Motor'}
          </Typography>
          <Typography>
            Waktu Mulai: {new Date(bookingInput.startTime).toLocaleString()}
          </Typography>
          <Typography>
            Durasi: {bookingInput.duration} jam
          </Typography>
          <Typography>
            Total Biaya: Rp{' '}
            {(parkingLot.rates[bookingInput.vehicleType] * bookingInput.duration).toLocaleString('id-ID')}
          </Typography>
          {bookingError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {bookingError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBookingDialogOpen(false)}>Batal</Button>
          <Button
            onClick={handleBooking}
            variant="contained"
            disabled={bookingLoading}
          >
            Konfirmasi Pemesanan
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ParkingLotDetailPage;