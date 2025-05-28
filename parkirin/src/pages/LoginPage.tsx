import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Alert,
  Link as MuiLink,
  Divider,
  IconButton
} from '@mui/material';
import { Google, Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { LoginInput } from '../types/index';
import type { GoogleCredentialResponse } from '../types/google-auth';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Email tidak valid')
    .required('Email wajib diisi'),
  password: yup
    .string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password wajib diisi'),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleAuth, isLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values: LoginInput) => {
      try {
        setError('');
        await login(values);
        navigate(from, { replace: true });
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Login gagal');
      }
    },
  });

  const handleGoogleLogin = async () => {
    try {
      setError('');
      
      // Initialize Google OAuth
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response: GoogleCredentialResponse) => {
            try {
              await googleAuth(response.credential);
              navigate(from, { replace: true });
            } catch (err: unknown) {
              const error = err as Error;
              setError(error.message || 'Google login gagal');
            }
          },
        });

        window.google.accounts.id.prompt();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Google login gagal');
    }
  };

  React.useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold">
            Masuk
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
            Masuk ke akun ParkirCepat Anda
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

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
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              {isLoading ? 'Masuk...' : 'Masuk'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                atau
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              sx={{ mb: 3 }}
            >
              Masuk dengan Google
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Belum punya akun?{' '}
                <MuiLink component={Link} to="/register" underline="hover">
                  Daftar di sini
                </MuiLink>
              </Typography>
            </Box>

            <Box textAlign="center" sx={{ mt: 1 }}>
              <MuiLink component={Link} to="/forgot-password" underline="hover" variant="body2">
                Lupa password?
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
