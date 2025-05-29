// src/hooks/useAuth.js
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { useApolloClient } from '@apollo/client';

const useAuth = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    login, 
    logout, 
    setUser,
    isLoading 
  } = useAuthStore();
  
  const client = useApolloClient();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser, storedToken);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          logout();
        }
      }
    };

    initAuth();
  }, [setUser, logout]);

  // Enhanced login function
  const handleLogin = async (userData, authToken) => {
    try {
      login(userData, authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Reset Apollo Client cache on login
      await client.resetStore();
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Enhanced logout function
  const handleLogout = async () => {
    try {
      logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear Apollo Client cache on logout
      await client.clearStore();
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Check if user is landowner
  const isLandowner = () => {
    return hasRole('landowner');
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is regular user
  const isRegularUser = () => {
    return hasRole('user');
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    hasRole,
    hasAnyRole,
    isLandowner,
    isAdmin,
    isRegularUser
  };
};

export default useAuth;
