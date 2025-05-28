import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { VERIFY_EMAIL, RESEND_VERIFICATION } from '../apollo/queries';
import { useAuth } from '../contexts/AuthContext';

const EmailVerificationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [verifyEmail, { loading }] = useMutation(VERIFY_EMAIL);
  const [resendVerification] = useMutation(RESEND_VERIFICATION);
  useEffect(() => {
    const handleVerification = async () => {
      try {
        const { data } = await verifyEmail({
          variables: { token }
        });
        
        if (data.verifyEmail.success) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
          setErrorMessage(data.verifyEmail.message);
        }
      } catch (error) {
        setVerificationStatus('error');
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    };

    if (token) {
      handleVerification();
    }
  }, [token, verifyEmail]);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      const { data } = await resendVerification({
        variables: { email: user.email }
      });
      
      if (data.resendVerification.success) {
        alert('Email verifikasi telah dikirim ulang');
      } else {
        alert(data.resendVerification.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            Memverifikasi email...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {verificationStatus === 'success' ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                Email berhasil diverifikasi!
              </Alert>
              <Typography paragraph>
                Sekarang Anda dapat menggunakan semua fitur ParkirCepat.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/')}
              >
                Kembali ke Beranda
              </Button>
            </>
          ) : verificationStatus === 'error' ? (
            <>
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage || 'Gagal memverifikasi email'}
              </Alert>
              <Typography paragraph>
                Link verifikasi mungkin sudah kadaluarsa atau tidak valid.
              </Typography>
              {user && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleResendVerification}
                >
                  Kirim Ulang Email Verifikasi
                </Button>
              )}
            </>
          ) : null}
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerificationPage; 