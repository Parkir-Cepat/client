import { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        _id
        email
        name
        role
        saldo
      }
    }
  }
`;

const GOOGLE_AUTH_MUTATION = gql`
  mutation GoogleAuth($token: String!) {
    googleAuth(token: $token) {
      token
      user {
        _id
        name
        email
        avatar
      }
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  
  // Form validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Client-side validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email wajib diisi');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Format email tidak valid');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password wajib diisi');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { token, user } = data.login;
      localStorage.setItem('token', token);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      setAuth(user, token);
      navigate('/dashboard');
    },
    onError: (error) => {
      setError(error.message || 'Terjadi kesalahan saat login');
    },
  });

  const [googleAuth, { loading: googleLoading }] = useMutation(GOOGLE_AUTH_MUTATION, {
    onCompleted: (data) => {
      const { token, user } = data.googleAuth;
      localStorage.setItem('token', token);
      setAuth(user, token);
      navigate('/dashboard');
    },
    onError: (error) => {
      setError(error.message || 'Google login gagal');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    login({
      variables: {
        input: {
          email: email.trim(),
          password,
        },
      },
    });
  };

  const handleGoogleSuccess = (response) => {
    setError('');
    googleAuth({
      variables: {
        token: response.credential,
      },
    });
  };

  const handleGoogleError = () => {
    setError('Google Sign In gagal. Silakan coba lagi.');
  };

  // Loading state check
  const isLoading = loading || googleLoading;

  return (
    <div className="w-screen h-screen bg-black flex">
      {/* Left Side - Decorative Images */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-red-500">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-80 h-80 bg-white rounded-3xl rotate-12 transform"></div>
          <div className="absolute bottom-32 right-16 w-72 h-72 bg-yellow-300 rounded-3xl -rotate-12 transform"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-orange-300 rounded-3xl rotate-45 transform"></div>
        </div>
        
        {/* Main Decorative Content */}
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="text-center">
            {/* Phone Mockup */}
            <div className="relative mx-auto mb-8">
              <div className="w-80 h-[600px] bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="h-6 bg-white flex items-center justify-between px-6 text-xs text-black">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-black rounded-sm"></div>
                      <div className="w-1 h-2 bg-black rounded-sm"></div>
                      <div className="w-6 h-2 bg-green-500 rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* App Content */}
                  <div className="flex flex-col h-full bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                    <div className="text-center mb-4">
                      <img 
                        src="/logo_ParkGo.png" 
                        alt="ParkGo" 
                        className="w-16 h-16 mx-auto mb-2"
                      />
                      <h3 className="text-lg font-bold text-orange-600">ParkGo</h3>
                    </div>
                    
                    {/* Parking Spots */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[1,2,3,4,5,6].map((i) => (
                        <div key={i} className={`h-16 rounded-lg flex items-center justify-center text-white font-bold ${
                          i % 3 === 0 ? 'bg-green-500' : i % 2 === 0 ? 'bg-red-500' : 'bg-orange-500'
                        }`}>
                          {i % 3 === 0 ? '✓' : i % 2 === 0 ? '✗' : '🚗'}
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Available Spots</span>
                        <span className="text-lg font-bold text-green-600">24</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Your Balance</span>
                        <span className="text-lg font-bold text-orange-600">Rp 50.000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4">
              Solusi Parkir Terdepan
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Temukan dan pesan tempat parkir dengan mudah. 
              Kelola kendaraan Anda dengan sistem yang aman dan terpercaya.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center bg-black p-8">
        <div className="w-full max-w-md">
          
          {/* Logo and Title */}
          <div className={`text-center mb-8 transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <img 
              src="/logo_ParkGo.png" 
              alt="ParkGo Logo" 
              className="w-20 h-20 mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-white mb-2">ParkGo</h1>
            <p className="text-gray-400 text-sm">
              Masuk untuk melanjutkan ke dashboard Anda
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className={`mb-6 transform transition-all duration-300 ${
              error ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={`space-y-4 transform transition-all duration-700 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            
            {/* Email Field */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                  emailError
                    ? 'border-red-500 bg-red-900/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                placeholder="Email atau nomor telepon"
              />
              {emailError && (
                <p className="text-red-400 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) validatePassword(e.target.value);
                }}
                onBlur={() => validatePassword(password)}
                className={`w-full px-4 py-3 pr-12 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                  passwordError
                    ? 'border-red-500 bg-red-900/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
              {passwordError && (
                <p className="text-red-400 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Sedang masuk...</span>
                </div>
              ) : (
                'Masuk'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-gray-400">ATAU</span>
              </div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <div className="transform hover:scale-105 transition-transform duration-200">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  size="large"
                  width="350"
                  theme="filled_black"
                  text="signin_with"
                  locale="id"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-center pt-4">
              <Link
                to="/forgot-password"
                className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors duration-200"
              >
                Lupa password?
              </Link>
            </div>
          </form>

          {/* Register Link */}
          <div className={`text-center mt-8 pt-6 border-t border-gray-800 transform transition-all duration-700 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <p className="text-gray-400 text-sm">
              Belum punya akun?{' '}
              <Link 
                to="/register" 
                className="text-orange-500 hover:text-orange-400 font-semibold transition-colors duration-200"
              >
                Daftar
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className={`text-center mt-8 transform transition-all duration-700 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <p className="text-gray-500 text-xs">
              © 2025 ParkGo. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;