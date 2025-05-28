import React from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Rating,
  Skeleton,
  Alert,
  InputAdornment,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Search,
  LocationOn
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useParkingSearch } from '../hooks/useParkingSearch';
import { useLocation } from '../hooks/useLocation';
import type { ParkingLot } from '../types';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: -6.2088,
  lng: 106.8456
};

const vehicleTypes = [
  { value: '', label: 'Semua Kendaraan' },
  { value: 'car', label: 'Mobil' },
  { value: 'motorcycle', label: 'Motor' },
  { value: 'truck', label: 'Truk' }
];

const sortOptions = [
  { value: 'distance', label: 'Jarak Terdekat' },
  { value: 'price', label: 'Harga Terendah' },
  { value: 'rating', label: 'Rating Tertinggi' }
];

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchResults, isLoading, error, searchParkingLots } = useParkingSearch();
  const { currentLocation, geocodeAddress } = useLocation();
  
  const searchResultsList = searchResults ?? [];
  
  const [searchFilters, setSearchFilters] = React.useState({
    location: searchParams.get('location') || '',
    vehicleType: searchParams.get('vehicleType') || '',
    minPrice: 0,
    maxPrice: 100000,
    radius: 5,
    sortBy: 'distance' as 'distance' | 'price' | 'rating',
    showAvailableOnly: true
  });
  
  const [selectedParkingLot, setSelectedParkingLot] = React.useState<ParkingLot | null>(null);
  const [mapCenter, setMapCenter] = React.useState(defaultCenter);
  const [showMap, setShowMap] = React.useState(true);
  // Initialize search on component mount
  const handleSearch = React.useCallback(async (coordinates?: { lat: number; lng: number }) => {
    try {
      let searchCoords = coordinates || currentLocation;
      
      if (!searchCoords && searchFilters.location) {
        searchCoords = await geocodeAddress(searchFilters.location);
      }
      
      if (!searchCoords) {
        throw new Error('Lokasi tidak ditemukan. Mohon cek kembali alamat yang dimasukkan.');
      }

      const searchInput = {
        lat: searchCoords.lat,
        lng: searchCoords.lng,
        radius: searchFilters.radius,
        vehicleType: searchFilters.vehicleType || undefined,
        minPrice: searchFilters.minPrice,
        maxPrice: searchFilters.maxPrice,
        sortBy: searchFilters.sortBy
      };

      await searchParkingLots(searchInput);
      
      // Update URL params
      const params = new URLSearchParams();
      params.set('location', searchFilters.location);
      params.set('lat', searchCoords.lat.toString());
      params.set('lng', searchCoords.lng.toString());
      if (searchFilters.vehicleType) params.set('vehicleType', searchFilters.vehicleType);
      setSearchParams(params);
    } catch (err) {
      console.error('Error during search:', err);
    }
  }, [currentLocation, searchFilters, geocodeAddress, searchParkingLots, setSearchParams]);

  React.useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (lat && lng) {
      const center = { lat: parseFloat(lat), lng: parseFloat(lng) };
      setMapCenter(center);
      handleSearch(center);
    } else if (currentLocation) {
      setMapCenter(currentLocation);
      handleSearch(currentLocation);
    }  }, [currentLocation, searchParams, handleSearch, setMapCenter]);

  const handleLocationSearch = async () => {
    if (searchFilters.location) {
      const coords = await geocodeAddress(searchFilters.location);
      if (coords) {
        setMapCenter(coords);
        handleSearch(coords);
      }
    }
  };

  const handleBooking = (parkingLot: ParkingLot) => {
    const bookingParams = new URLSearchParams({
      parkingLotId: parkingLot._id,
      vehicleType: searchFilters.vehicleType || 'car',
      duration: '2'
    });
    navigate(`/booking?${bookingParams.toString()}`);
  };
  const renderParkingCard = (parkingLot: ParkingLot) => {
    const availableSlots = parkingLot.available ? 
      (parkingLot.available.car + parkingLot.available.motorcycle) : 0;
    const totalRating = parkingLot.rating || 0;
    const carRate = parkingLot.rates?.car || 0;
    const motorRate = parkingLot.rates?.motorcycle || 0;
    const minRate = Math.min(carRate, motorRate);

    return (
      <Card key={parkingLot._id} sx={{ mb: 2 }}>
        <CardMedia
          component="img"
          height="200"
          image={parkingLot.photos?.[0] || '/placeholder-parking.jpg'}
          alt={parkingLot.name}
        />
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {parkingLot.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
            {parkingLot.address}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={totalRating} readOnly size="small" />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({totalRating.toFixed(1)})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              size="small" 
              label={`${availableSlots} slot tersedia`}
              color={availableSlots > 0 ? 'success' : 'error'}
            />
            <Chip 
              size="small" 
              label={`Rp ${minRate.toLocaleString('id-ID')}/jam`}
              color="primary"
            />
            {parkingLot.distance && (
              <Chip 
                size="small" 
                label={`${parkingLot.distance.toFixed(1)} km`}
                variant="outlined"
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {parkingLot.capacity?.car && (
              <Chip
                size="small"
                label="Mobil"
                variant="outlined"
              />
            )}
            {parkingLot.capacity?.motorcycle && (
              <Chip
                size="small"
                label="Motor"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
        <CardActions>
          <Button 
            variant="contained" 
            fullWidth
            disabled={availableSlots === 0}
            onClick={() => handleBooking(parkingLot)}
          >
            {availableSlots === 0 ? 'Penuh' : 'Booking Sekarang'}
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Search Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Cari lokasi..."
              value={searchFilters.location}
              onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              select
              label="Jenis Kendaraan"
              value={searchFilters.vehicleType}
              onChange={(e) => setSearchFilters({ ...searchFilters, vehicleType: e.target.value })}
            >
              {vehicleTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              select
              label="Urutkan"
              value={searchFilters.sortBy}              onChange={(e) => {
                setSearchFilters({ 
                  ...searchFilters, 
                  sortBy: e.target.value as 'distance' | 'price' | 'rating' 
                });
              }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleLocationSearch}
              startIcon={<Search />}
            >
              Cari
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showMap}
                  onChange={(e) => setShowMap(e.target.checked)}
                />
              }
              label="Tampilkan Peta"
            />
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={3}>            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" gutterBottom>
                Radius Pencarian: {searchFilters.radius} km
              </Typography>
              <Slider
                value={searchFilters.radius}
                onChange={(_, value) => setSearchFilters({ ...searchFilters, radius: value as number })}
                min={1}
                max={50}
                valueLabelDisplay="auto"
              />
            </Grid>            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" gutterBottom>
                Harga per Jam: Rp {searchFilters.minPrice.toLocaleString('id-ID')} - Rp {searchFilters.maxPrice.toLocaleString('id-ID')}
              </Typography>
              <Slider
                value={[searchFilters.minPrice, searchFilters.maxPrice]}
                onChange={(_, value) => {
                  const [min, max] = value as number[];
                  setSearchFilters({ ...searchFilters, minPrice: min, maxPrice: max });
                }}
                min={0}
                max={100000}
                step={5000}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `Rp ${value.toLocaleString('id-ID')}`}
              />
            </Grid>            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={searchFilters.showAvailableOnly}
                    onChange={(e) => setSearchFilters({ ...searchFilters, showAvailableOnly: e.target.checked })}
                  />
                }
                label="Hanya yang tersedia"
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Map Section */}        {showMap && (
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper elevation={2} sx={{ p: 2, height: '500px' }}>
              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={13}
                >
                  {/* Current location marker */}
                  {currentLocation && (
                    <Marker
                      position={currentLocation}
                      icon={{
                        url: '/current-location-icon.png',
                        scaledSize: new window.google.maps.Size(30, 30),
                      }}
                    />
                  )}
          {/* Parking lot markers */}
                  {!isLoading && searchResultsList.map((parkingLot: ParkingLot) => (
                    <Marker
                      key={parkingLot._id}
                      position={{
                        lat: parkingLot.location.coordinates[1],
                        lng: parkingLot.location.coordinates[0],
                      }}
                      onClick={() => setSelectedParkingLot(parkingLot)}
                      icon={{
                        url: parkingLot.availableSlots > 0 ? '/parking-available.png' : '/parking-full.png',
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  ))}

                  {/* Info Window */}
                  {selectedParkingLot && (
                    <InfoWindow
                      position={{
                        lat: selectedParkingLot.location.coordinates[1],
                        lng: selectedParkingLot.location.coordinates[0],
                      }}
                      onCloseClick={() => setSelectedParkingLot(null)}
                    >
                      <Box sx={{ maxWidth: 250 }}>
                        <Typography variant="h6" gutterBottom>
                          {selectedParkingLot.name}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {selectedParkingLot.address}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Rp {selectedParkingLot.tariff.toLocaleString('id-ID')}/jam
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {selectedParkingLot.availableSlots} slot tersedia
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleBooking(selectedParkingLot)}
                          disabled={selectedParkingLot.availableSlots === 0}
                        >
                          Book
                        </Button>
                      </Box>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </Paper>
          </Grid>
        )}

        {/* Results Section */}
        <Grid size={{ xs: 12, lg: showMap ? 4 : 12 }}>          <Typography variant="h5" gutterBottom>            Hasil Pencarian ({searchResultsList.length})
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box>
              {[1, 2, 3].map((i) => (
                <Card key={i} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} />
                  </CardContent>
                </Card>
              ))}
            </Box>          ) : !searchResultsList.length ? (
            <Alert severity="info">
              Tidak ada tempat parkir ditemukan. Coba ubah filter pencarian Anda.
            </Alert>
          ) : (
            <Box sx={{ maxHeight: showMap ? '500px' : 'none', overflow: 'auto' }}>              {searchResultsList
                .filter((lot: ParkingLot) => !searchFilters.showAvailableOnly || lot.availableSlots > 0)
                .map(renderParkingCard)}
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchPage;
