import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Alert,
  Divider,
  CircularProgress,
  Grid,
  Snackbar
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { TOP_UP_SALDO } from '../apollo/paymentQueries';
import { ME } from '../apollo/queries';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const paymentMethods = [
  { value: 'qris', label: 'QRIS' },
  { value: 'virtual_account', label: 'Virtual Account' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'credit_card', label: 'Kartu Kredit' },
];

// Tipe untuk hasil payment info
interface PaymentInfo {
  _id: string;
  amount: number;
  paymentMethod?: string;
  status?: string;
  qrCodeUrl?: string;
  paymentUrl?: string;
  paymentToken?: string;
  transactionId?: string;
}

const TopUpPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(10000);
  const [paymentMethod, setPaymentMethod] = useState<string>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saldoUpdated, setSaldoUpdated] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const [topUpSaldo] = useMutation(TOP_UP_SALDO);
  const { refetch: refetchUser } = useQuery(ME, { skip: !paymentInfo });

  // Polling saldo setelah top up
  useEffect(() => {
    if (!paymentInfo || !user) return;
    setIsPolling(true);
    let pollingCount = 0;
    const interval = window.setInterval(async () => {
      pollingCount++;
      const { data } = await refetchUser();
      if (data?.me?.saldo > user.saldo) {
        setSaldoUpdated(true);
        setShowSnackbar(true);
        setIsPolling(false);
        clearInterval(interval);
        setTimeout(() => navigate('/topup-success'), 2000);
      }
      // Stop polling setelah 1 menit
      if (pollingCount > 20) {
        setIsPolling(false);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentInfo, user, refetchUser, navigate]);

  // Validasi input
  const isAmountValid = amount >= 10000 && amount <= 500000000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isAmountValid) {
      setError('Nominal top up minimal Rp 10.000 dan maksimal Rp 500.000.000');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await topUpSaldo({
        variables: {
          input: {
            amount,
            paymentMethod,
          },
        },
      });
      setPaymentInfo(data.topUpSaldo);
      toast.success('Permintaan top up berhasil. Silakan lanjutkan pembayaran.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Gagal melakukan top up');
      } else {
        setError('Gagal melakukan top up');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render instruksi pembayaran setelah submit
  const renderPaymentInstructions = () => {
    if (!paymentInfo) return null;
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 2, justifyContent: 'center' }}>
          <b>Permintaan top up berhasil!</b><br />
          <span style={{ fontWeight: 400 }}>
            Silakan klik tombol di bawah untuk melanjutkan pembayaran melalui Midtrans.<br />
            Setelah pembayaran berhasil, saldo Anda akan otomatis bertambah.
          </span>
        </Alert>
        {isPolling && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={32} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">Menunggu konfirmasi pembayaran...</Typography>
          </Box>
        )}
        {saldoUpdated && (
          <Alert severity="info" sx={{ mb: 2, justifyContent: 'center' }}>
            Saldo Anda sudah bertambah! Anda akan diarahkan ke halaman sukses.
          </Alert>
        )}
        {paymentInfo.qrCodeUrl && (
          <Button
            variant="contained"
            color="primary"
            href={paymentInfo.qrCodeUrl}
            target="_blank"
            sx={{ mb: 2, fontWeight: 'bold', fontSize: 16, py: 1.5 }}
            fullWidth
          >
            Lanjutkan ke Pembayaran
          </Button>
        )}
        <Divider sx={{ my: 2 }} />
        <Button variant="outlined" fullWidth onClick={() => navigate('/profile')}>
          Kembali ke Profil
        </Button>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowSnackbar(false)} severity="success" sx={{ width: '100%' }}>
            Saldo berhasil ditambahkan!
          </Alert>
        </Snackbar>
      </Box>
    );
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="warning">Silakan login untuk melakukan top up saldo.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Top Up Saldo
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Saldo Anda saat ini: <b>Rp {user.saldo.toLocaleString('id-ID')}</b>
        </Typography>
        <Divider sx={{ my: 2 }} />
        {paymentInfo ? (
          renderPaymentInstructions()
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid>
                <TextField
                  label="Nominal Top Up"
                  type="number"
                  fullWidth
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  inputProps={{ min: 10000, max: 500000000, step: 1000 }}
                  required
                  disabled={isSubmitting}
                  helperText="Minimal Rp 10.000, maksimal Rp 500.000.000"
                />
              </Grid>
              <Grid>
                <TextField
                  select
                  label="Metode Pembayaran"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  fullWidth
                  required
                  disabled={isSubmitting}
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {error && (
                <Grid>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              <Grid>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitting || !isAmountValid}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Memproses...' : 'Top Up Sekarang'}
                </Button>
              </Grid>
              <Grid>
                <Button variant="text" fullWidth onClick={() => navigate('/profile')}>
                  Batal / Kembali ke Profil
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default TopUpPage; 