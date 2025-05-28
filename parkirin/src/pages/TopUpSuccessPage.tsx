import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const TopUpSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2, animation: 'pop 0.5s' }} />
          <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
            Top Up Berhasil!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Saldo Anda sudah bertambah dan siap digunakan.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }} onClick={() => navigate('/')}>Kembali ke Beranda</Button>
        <Button variant="outlined" fullWidth onClick={() => navigate('/profile')}>Lihat Profil</Button>
      </Paper>
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </Container>
  );
};

export default TopUpSuccessPage; 