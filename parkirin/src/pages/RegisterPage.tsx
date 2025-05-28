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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  IconButton
} from '@mui/material';
import { Google, Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { RegisterInput } from '../types/index';
import { initGoogleSignIn } from '../utils/googleAuth';

const validationSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .required('Nama wajib diisi'),
  email: yup
    .string()
    .email('Email tidak valid')
    .required('Email wajib diisi'),
  password: yup
    .string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password wajib diisi'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
  role: yup
    .string()
    .oneOf(['user', 'landowner'], 'Role tidak valid')
    .required('Role wajib dipilih'),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, googleAuth, isLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user' as 'user' | 'landowner',
    },
    validationSchema,    onSubmit: async (values) => {
      try {
        setError('');
        // Ensure we're sending the registration data in the correct format
        const registerData: RegisterInput = {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          role: values.role,
        };
        
        console.log('Submitting registration:', {
          ...registerData,
          password: '[REDACTED]'
        });
        
        await register(registerData);
        navigate('/');
      } catch (err) {
        console.error('Registration error:', err);
        if (err instanceof Error) {
          setError(err.message || 'Registrasi gagal');
        } else {
          setError('Registrasi gagal');
        }
      }
    },
  });
  const handleGoogleLogin = async () => {
    try {
      setError('');
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID tidak ditemukan');
      }

      initGoogleSignIn(
        clientId,
        async (credential) => {
          await googleAuth(credential);
          navigate('/');
        },
        (errorMsg) => setError(errorMsg)
      );
    } catch (err) {
      console.error('Google initialization error:', err);
      setError(err instanceof Error ? err.message : 'Google login gagal');
    }
  };
  React.useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return script;
    };

    const script = loadGoogleScript();

    return () => {
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
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
            Daftar
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
            Buat akun ParkirCepat baru
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Nama Lengkap"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              sx={{ mb: 2 }}
            />

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

            <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
              <FormLabel component="legend">Daftar sebagai:</FormLabel>
              <RadioGroup
                row
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
              >
                <FormControlLabel 
                  value="user" 
                  control={<Radio />} 
                  label="Pengguna" 
                />
                <FormControlLabel 
                  value="landowner" 
                  control={<Radio />} 
                  label="Pemilik Lahan" 
                />
              </RadioGroup>
            </FormControl>

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
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Konfirmasi Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              {isLoading ? 'Mendaftar...' : 'Daftar'}
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
              Daftar dengan Google
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Sudah punya akun?{' '}
                <MuiLink component={Link} to="/login" underline="hover">
                  Masuk di sini
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
