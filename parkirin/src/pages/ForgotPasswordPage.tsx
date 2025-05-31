import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { FORGOT_PASSWORD } from '../apollo/queries';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Email tidak valid')
    .required('Email wajib diisi'),
});

const ForgotPasswordPage: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { data } = await forgotPassword({
          variables: { email: values.email }
        });
        
        if (data.forgotPassword.success) {
          setSuccess(true);
        }
      } catch (error) {
        if (error instanceof Error) {
          formik.setErrors({ email: error.message });
        }
      }
    },
  });

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
          <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold">
            Lupa Password
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
            Masukkan email Anda untuk mereset password
          </Typography>

          {success ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                Link reset password telah dikirim ke email Anda
              </Alert>
              <Typography paragraph>
                Silakan cek email Anda dan ikuti instruksi untuk mereset password.
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                fullWidth
              >
                Kembali ke Login
              </Button>
            </>
          ) : (
            <Box component="form" onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 3 }}
              >
                {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
              </Button>

              <Box textAlign="center">
                <MuiLink component={Link} to="/login" underline="hover">
                  Kembali ke Login
                </MuiLink>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage; 