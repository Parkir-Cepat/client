import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { GET_PAYMENT_HISTORY, CREATE_PAYMENT } from '../apollo/queries';
import { useAuth } from '../hooks/useAuth';

interface PaymentMethod {
  id: string;
  label: string;
  type: 'saldo' | 'qris' | 'virtual_account' | 'bank_transfer';
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'saldo',
    label: 'Saldo ParkirCepat',
    type: 'saldo',
    description: 'Bayar menggunakan saldo yang tersedia',
  },
  {
    id: 'qris',
    label: 'QRIS',
    type: 'qris',
    description: 'Bayar menggunakan aplikasi e-wallet favorit Anda',
  },
  {
    id: 'bca_va',
    label: 'Virtual Account BCA',
    type: 'virtual_account',
    description: 'Transfer melalui ATM BCA, m-BCA, atau internet banking',
  },
  {
    id: 'mandiri_va',
    label: 'Virtual Account Mandiri',
    type: 'virtual_account',
    description: 'Transfer melalui ATM Mandiri, m-banking, atau internet banking',
  },
];

const PaymentPage: React.FC = () => {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('saldo');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: paymentData, loading: paymentLoading, error } = useQuery(GET_PAYMENT_HISTORY, {
    variables: { limit: 10, offset: 0 },
  });

  const [createPayment] = useMutation(CREATE_PAYMENT);

  useEffect(() => {
    if (paymentData?.getBookingPayment) {
      // If payment exists, redirect to booking detail
      navigate(`/bookings/${bookingId}`);
    }
  }, [paymentData, bookingId, navigate]);

  if (!user) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Alert severity="warning">
            Silakan login untuk melanjutkan pembayaran.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (paymentLoading) {
    return (
      <Container>
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            Terjadi kesalahan saat memuat data pembayaran.
          </Alert>
        </Box>
      </Container>
    );
  }

  const booking = paymentData?.getBookingPayment?.booking;

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Pilih metode pembayaran');
      return;
    }

    try {
      setIsProcessing(true);
      const { data } = await createPayment({
        variables: {
          input: {
            bookingId,
            paymentMethod: selectedMethod,
          },
        },
      });

      if (data?.createPayment?.qrCodeUrl) {
        // Handle QRIS payment
        window.open(data.createPayment.qrCodeUrl, '_blank');
      }

      // Redirect to booking detail
      navigate(`/bookings/${bookingId}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Gagal memproses pembayaran');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Pembayaran
        </Typography>

        <Grid container spacing={3}>          {/* Booking Details */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detail Booking
                </Typography>
                {booking && (
                  <>
                    <Grid container spacing={2}>                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Lokasi Parkir
                        </Typography>
                        <Typography variant="body1">
                          {booking.parkingLot.name}
                        </Typography>
                      </Grid>                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Durasi
                        </Typography>
                        <Typography variant="body1">
                          {booking.duration} jam
                        </Typography>
                      </Grid>                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Jenis Kendaraan
                        </Typography>
                        <Typography variant="body1">
                          {booking.vehicleType === 'car' ? 'Mobil' : 'Motor'}
                        </Typography>
                      </Grid>                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Biaya
                        </Typography>
                        <Typography variant="h6" color="primary">
                          Rp {booking.cost.toLocaleString('id-ID')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>          {/* Payment Methods */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Pilih Metode Pembayaran
                  </FormLabel>
                  <RadioGroup
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  >
                    {paymentMethods.map((method) => (
                      <Box key={method.id} sx={{ mb: 2 }}>
                        <FormControlLabel
                          value={method.id}
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="subtitle1">
                                {method.label}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {method.description}
                              </Typography>
                            </Box>
                          }
                          sx={{
                            alignItems: 'flex-start',
                            '& .MuiRadio-root': {
                              pt: 1,
                            },
                          }}
                        />
                        {method.id !== paymentMethods[paymentMethods.length - 1].id && (
                          <Divider sx={{ my: 2 }} />
                        )}
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>          {/* Action Buttons */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate(`/bookings/${bookingId}`)}
              >
                Kembali
              </Button>
              <Button
                variant="contained"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Bayar Sekarang'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PaymentPage;
