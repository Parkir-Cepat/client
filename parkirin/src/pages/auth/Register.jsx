import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../store/authStore';
import { Button, Input, Card, Badge } from '../../components/common';

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        _id
        email
        name
        role
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

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      const { token, user } = data.register;
      localStorage.setItem('token', token);
      setAuth(user, token);
      navigate('/dashboard');
    },
    onError: (error) => {
      setError(error.message);
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
      setError(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    register({
      variables: {
        input: formData,
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleSuccess = (response) => {
    googleAuth({
      variables: {
        token: response.credential,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join Parkirin and find the perfect parking spot
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="John Doe"
          fullWidth
        />

        <Input
          label="Email Address"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="your@email.com"
          fullWidth
        />

        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="••••••••"
          withToggle
          fullWidth
          helper="Must be at least 8 characters"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Account Type</label>
          <div className="flex gap-4">
            <div 
              className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${
                formData.role === 'user' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-orange-200'
              }`}
              onClick={() => setFormData({ ...formData, role: 'user' })}
            >
              <div className="flex items-center mb-1">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                />
                <label className="ml-2 font-medium text-gray-900">User</label>
              </div>
              <p className="text-xs text-gray-500 ml-6">Find and book parking spots</p>
            </div>
            
            <div 
              className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${
                formData.role === 'landowner' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-orange-200'
              }`}
              onClick={() => setFormData({ ...formData, role: 'landowner' })}
            >
              <div className="flex items-center mb-1">
                <input
                  type="radio"
                  name="role"
                  value="landowner"
                  checked={formData.role === 'landowner'}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                />
                <label className="ml-2 font-medium text-gray-900">Landowner</label>
              </div>
              <p className="text-xs text-gray-500 ml-6">List your parking spaces</p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <Link to="/terms" className="font-medium text-orange-600 hover:text-orange-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-medium text-orange-600 hover:text-orange-500">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          disabled={loading || googleLoading}
          loading={loading}
        >
          Create Account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed')}
          useOneTap
          theme="outline"
          shape="rectangular"
          text="signup_with"
          locale="en"
        />
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
