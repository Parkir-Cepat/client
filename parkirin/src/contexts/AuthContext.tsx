import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN, ME, REGISTER, GOOGLE_AUTH } from '../apollo/queries';
import type { RegisterInput, LoginInput, User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: (emailOrValues: string | LoginInput, password?: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  googleAuth: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);
  const [googleAuthMutation] = useMutation(GOOGLE_AUTH);
  
  const { data: userData, loading: userLoading } = useQuery(ME, {
    skip: !localStorage.getItem('token')
  });

  useEffect(() => {
    if (userData?.me) {
      setUser(userData.me);
    }
    if (!userLoading) {
      setLoading(false);
    }
  }, [userData, userLoading]);

  const login = async (emailOrValues: string | LoginInput, password?: string) => {
    try {
      let loginInput: LoginInput;
      
      if (typeof emailOrValues === 'string' && password) {
        // Called with separate email and password parameters
        loginInput = { email: emailOrValues, password };
      } else if (typeof emailOrValues === 'object') {
        // Called with LoginInput object
        loginInput = emailOrValues;
      } else {
        throw new Error('Invalid login parameters');
      }

      const { data } = await loginMutation({
        variables: {
          input: loginInput
        }
      });
      localStorage.setItem('token', data.login.token);
      setUser(data.login.user);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const register = async (registerInput: RegisterInput) => {
    try {
      console.log('Registering with input:', {
        ...registerInput,
        password: '[REDACTED]'
      });
      
      const { data } = await registerMutation({
        variables: {
          input: registerInput
        }
      });
      
      if (data?.register?.token) {
        localStorage.setItem('token', data.register.token);
        setUser(data.register.user);
        setError(null);
      } else {
        throw new Error('Registration response missing token or user data');
      }
    } catch (err) {
      console.error('Registration mutation error:', err);
      setError(err as Error);
      throw err;
    }
  };

  const googleAuth = async (token: string) => {
    try {
      const { data } = await googleAuthMutation({
        variables: { token }
      });
      localStorage.setItem('token', data.googleAuth.token);
      setUser(data.googleAuth.user);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoading: loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        googleAuth,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Single export for AuthContext and AuthProvider
export { AuthContext, AuthProvider, useAuth };
