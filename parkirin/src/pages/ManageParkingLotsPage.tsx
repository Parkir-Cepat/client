import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Fab,
  Divider,
  Avatar,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocalParking as ParkingIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as MotorcycleIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import { 
  GET_MY_PARKING_LOTS, 
  CREATE_PARKING_LOT, 
  UPDATE_PARKING_LOT, 
  DELETE_PARKING_LOT 
} from '../apollo/queries';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ParkingLot } from '../types';

interface CreateParkingLotInput {
  name: string;
  address: string;
  location: {
    coordinates: [number, number];
  };
  capacity: {
    car: number;
    motorcycle: number;
  };
  rates: {
    car: number;
    motorcycle: number;
  };
  operationalHours: {
    open: string;
    close: string;
  };
  facilities: string[];
  images: string[];
}

const ManageParkingLotsPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null);
  const [deleteConfirmLot, setDeleteConfirmLot] = useState<ParkingLot | null>(null);
  
  const [formData, setFormData] = useState<CreateParkingLotInput>({
    name: '',
    address: '',
    location: { coordinates: [106.8456, -6.2088] }, // Default Jakarta coordinates
    capacity: { car: 10, motorcycle: 20 },
    rates: { car: 5000, motorcycle: 2000 },
    operationalHours: { open: '08:00', close: '22:00' },
    facilities: [],
    images: []
  });

  const { data, loading, error, refetch } = useQuery(GET_MY_PARKING_LOTS, {
    fetchPolicy: 'cache-and-network',
  });

  const [createParkingLot, { loading: createLoading }] = useMutation(CREATE_PARKING_LOT, {
    onCompleted: () => {
      toast.success('Tempat parkir berhasil dibuat');
      setOpenDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Gagal membuat tempat parkir: ${error.message}`);
    },
  });

  const [updateParkingLot, { loading: updateLoading }] = useMutation(UPDATE_PARKING_LOT, {
    onCompleted: () => {
      toast.success('Tempat parkir berhasil diperbarui');
      setOpenDialog(false);
      setEditingLot(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui tempat parkir: ${error.message}`);
    },
  });

  const [deleteParkingLot, { loading: deleteLoading }] = useMutation(DELETE_PARKING_LOT, {
    onCompleted: () => {
      toast.success('Tempat parkir berhasil dihapus');
      setDeleteConfirmLot(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Gagal menghapus tempat parkir: ${error.message}`);
    },
  });

  const parkingLots: ParkingLot[] = data?.getMyParkingLots || [];

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      location: { coordinates: [106.8456, -6.2088] },
      capacity: { car: 10, motorcycle: 20 },
      rates: { car: 5000, motorcycle: 2000 },
      operationalHours: { open: '08:00', close: '22:00' },
      facilities: [],
      images: []
    });
  };

  const handleOpenDialog = (lot?: ParkingLot) => {
    if (lot) {
      setEditingLot(lot);
      setFormData({
        name: lot.name,
        address: lot.address,
        location: lot.location || { coordinates: [106.8456, -6.2088] },
        capacity: lot.capacity || { car: 10, motorcycle: 20 },
        rates: lot.rates || { car: 5000, motorcycle: 2000 },
        operationalHours: lot.operationalHours || { open: '08:00', close: '22:00' },
        facilities: lot.facilities || [],
        images: lot.images || []
      });
    } else {
      setEditingLot(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLot(null);
    resetForm();
  };

  const handleSubmit = async () => {
    try {
      if (editingLot) {
        await updateParkingLot({
          variables: {
            id: editingLot._id,
            input: formData
          }
        });
      } else {
        await createParkingLot({
          variables: { input: formData }
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (lot: ParkingLot) => {
    try {
      await deleteParkingLot({
        variables: { id: lot._id }
      });
    } catch (error) {
      console.error('Error deleting parking lot:', error);
    }
  };

  const getStatusChip = (lot: ParkingLot) => {
    const occupiedSlots = (lot.capacity?.car || 0) + (lot.capacity?.motorcycle || 0) - 
                         (lot.available?.car || 0) - (lot.available?.motorcycle || 0);
    const totalSlots = (lot.capacity?.car || 0) + (lot.capacity?.motorcycle || 0);
    const occupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

    if (occupancyRate >= 90) return <Chip label="Penuh" color="error" size="small" />;
    if (occupancyRate >= 70) return <Chip label="Ramai" color="warning" size="small" />;
    if (occupancyRate >= 30) return <Chip label="Sedang" color="info" size="small" />;
    return <Chip label="Kosong" color="success" size="small" />;
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Gagal memuat data tempat parkir: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={500}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <ParkingIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  Kelola Tempat Parkir
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tambah, edit, dan kelola semua tempat parkir Anda
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              size="large"
            >
              Tambah Tempat Parkir
            </Button>
          </Box>

          {/* Stats Summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Tempat Parkir
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {parkingLots.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Slot
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {parkingLots.reduce((sum, lot) => sum + (lot.capacity?.car || 0) + (lot.capacity?.motorcycle || 0), 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Rata-rata Rating
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {parkingLots.length > 0 
                      ? (parkingLots.reduce((sum, lot) => sum + (lot.rating || 0), 0) / parkingLots.length).toFixed(1)
                      : '0.0'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Status Aktif
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {parkingLots.filter(lot => lot.status === 'active').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Parking Lots Grid */}
          {parkingLots.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <ParkingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Belum Ada Tempat Parkir
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Mulai dengan membuat tempat parkir pertama Anda
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Tambah Tempat Parkir
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {parkingLots.map((lot) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={lot._id}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {lot.images && lot.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        height={200}
                        image={lot.images[0]}
                        alt={lot.name}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <PhotoIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                      </Box>
                    )}
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {lot.name}
                        </Typography>
                        {getStatusChip(lot)}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {lot.address}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CarIcon fontSize="small" />
                          <Typography variant="body2">
                            {lot.available?.car || 0}/{lot.capacity?.car || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MotorcycleIcon fontSize="small" />
                          <Typography variant="body2">
                            {lot.available?.motorcycle || 0}/{lot.capacity?.motorcycle || 0}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Mobil: Rp {(lot.rates?.car || 0).toLocaleString('id-ID')}/jam
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Motor: Rp {(lot.rates?.motorcycle || 0).toLocaleString('id-ID')}/jam
                        </Typography>
                      </Box>

                      {lot.rating !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
                          <Typography variant="body2">
                            {lot.rating.toFixed(1)} ({lot.reviewCount || 0} ulasan)
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        Dibuat {formatDistanceToNow(new Date(lot.createdAt), { 
                          addSuffix: true, 
                          locale: localeId 
                        })}
                      </Typography>
                    </CardContent>

                    <Divider />
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        href={`/parking-lots/${lot._id}`}
                      >
                        Lihat
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(lot)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteConfirmLot(lot)}
                      >
                        Hapus
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Floating Action Button */}
          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => handleOpenDialog()}
          >
            <AddIcon />
          </Fab>

          {/* Create/Edit Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              {editingLot ? 'Edit Tempat Parkir' : 'Tambah Tempat Parkir Baru'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Nama Tempat Parkir"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Alamat"
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={formData.location.coordinates[0]}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { 
                        coordinates: [parseFloat(e.target.value), formData.location.coordinates[1]] 
                      } 
                    })}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={formData.location.coordinates[1]}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { 
                        coordinates: [formData.location.coordinates[0], parseFloat(e.target.value)] 
                      } 
                    })}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Kapasitas Mobil"
                    type="number"
                    value={formData.capacity.car}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      capacity: { ...formData.capacity, car: parseInt(e.target.value) || 0 } 
                    })}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Kapasitas Motor"
                    type="number"
                    value={formData.capacity.motorcycle}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      capacity: { ...formData.capacity, motorcycle: parseInt(e.target.value) || 0 } 
                    })}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Tarif Mobil (per jam)"
                    type="number"
                    value={formData.rates.car}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      rates: { ...formData.rates, car: parseInt(e.target.value) || 0 } 
                    })}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Tarif Motor (per jam)"
                    type="number"
                    value={formData.rates.motorcycle}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      rates: { ...formData.rates, motorcycle: parseInt(e.target.value) || 0 } 
                    })}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Jam Buka"
                    type="time"
                    value={formData.operationalHours.open}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      operationalHours: { ...formData.operationalHours, open: e.target.value } 
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Jam Tutup"
                    type="time"
                    value={formData.operationalHours.close}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      operationalHours: { ...formData.operationalHours, close: e.target.value } 
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Batal</Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                disabled={createLoading || updateLoading}
              >
                {createLoading || updateLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  editingLot ? 'Perbarui' : 'Buat'
                )}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteConfirmLot} onClose={() => setDeleteConfirmLot(null)}>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogContent>
              <Typography>
                Apakah Anda yakin ingin menghapus tempat parkir "{deleteConfirmLot?.name}"?
                Tindakan ini tidak dapat dibatalkan.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteConfirmLot(null)}>Batal</Button>
              <Button 
                onClick={() => deleteConfirmLot && handleDelete(deleteConfirmLot)}
                color="error"
                variant="contained"
                disabled={deleteLoading}
              >
                {deleteLoading ? <CircularProgress size={20} /> : 'Hapus'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </Container>
  );
};

export default ManageParkingLotsPage;
