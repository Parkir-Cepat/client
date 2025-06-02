import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import { 
  Search, 
  LocationOn, 
  DirectionsCar, 
  Star,
  AccessTime,
  LocalParking 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import type { ParkingSearchForm } from '../types/index';
import LogoGroup from '../components/LogoGroup';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLocation, getCurrentLocation } = useLocation();
  
  const [searchForm, setSearchForm] = React.useState<Partial<ParkingSearchForm>>({
    location: '',
    vehicleType: 'car',
    duration: 2
  });

  React.useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const handleSearch = () => {
    if (searchForm.location && searchForm.vehicleType) {
      const searchParams = new URLSearchParams({
        location: searchForm.location,
        vehicleType: searchForm.vehicleType,
        duration: searchForm.duration?.toString() || '2'
      });
      
      if (currentLocation) {
        searchParams.append('lat', currentLocation.lat.toString());
        searchParams.append('lng', currentLocation.lng.toString());
      }
      
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  const features = [
    {
      icon: <Search color="primary" />,
      title: 'Pencarian Mudah',
      description: 'Temukan tempat parkir terdekat dengan mudah berdasarkan lokasi Anda'
    },
    {
      icon: <DirectionsCar color="primary" />,
      title: 'Booking Real-time',
      description: 'Booking tempat parkir secara real-time dengan konfirmasi langsung'
    },
    {
      icon: <Star color="primary" />,
      title: 'Rating & Review',
      description: 'Lihat rating dan review dari pengguna lain untuk pengalaman terbaik'
    },
    {
      icon: <AccessTime color="primary" />,
      title: 'Fleksibel',
      description: 'Atur waktu parkir sesuai kebutuhan dengan durasi yang fleksibel'
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* ParkGo Logos Section */}
      <Box sx={{ py: 4 }}>
        <LogoGroup />
      </Box>
      {/* Hero Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Parkir Cepat & Mudah
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Temukan dan booking tempat parkir terdekat dengan mudah
        </Typography>
        
        {/* Search Form */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mt: 4, 
            mb: 6,
            borderRadius: 2,
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                placeholder="Cari lokasi..."
                value={searchForm.location}
                onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                select
                value={searchForm.vehicleType}
                onChange={(e) => setSearchForm({ ...searchForm, vehicleType: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="car">Mobil</option>
                <option value="motorcycle">Motor</option>
                <option value="truck">Truk</option>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSearch}
                disabled={!searchForm.location}
                startIcon={<Search />}
              >
                Cari
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>
          Mengapa Pilih ParkirCepat?
        </Typography>        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      {!user && (
        <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'primary.main', color: 'white', borderRadius: 2, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Mulai Sekarang!
          </Typography>
          <Typography variant="h6" paragraph>
            Daftar sekarang dan dapatkan kemudahan parkir di ujung jari Anda
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large" 
              sx={{ mr: 2 }}
              onClick={() => navigate('/register')}
            >
              Daftar Sekarang
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ color: 'white', borderColor: 'white' }}
              onClick={() => navigate('/login')}
            >
              Masuk
            </Button>
          </Box>
        </Box>
      )}

      {/* Quick Actions for Logged In Users */}
      {user && (
        <Box sx={{ py: 4 }}>
          <Typography variant="h5" gutterBottom>
            Aksi Cepat
          </Typography>          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/bookings')}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocalParking sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Booking Aktif</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lihat booking yang sedang berlangsung
                  </Typography>
                </CardContent>
              </Card>
            </Grid>            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    Rp {user.saldo.toLocaleString('id-ID')}
                  </Typography>
                  <Typography variant="h6">Saldo</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Top up saldo Anda
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {user.role === 'landowner' && (
              <>                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/landowner/parking-lots')}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <LocalParking sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h6">Kelola Parkir</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Kelola tempat parkir Anda
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/landowner/add-parking')}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Button variant="contained" fullWidth>
                        Tambah Parkir Baru
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default HomePage;
