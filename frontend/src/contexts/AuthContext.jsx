import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === 'admin');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      // For development, simulate successful login
      const mockUser = {
        id: '1',
        name: 'Admin User',
        email: email,
        role: 'admin'
      };
      const mockToken = 'mock-jwt-token';
      
      setUser(mockUser);
      setIsAdmin(mockUser.role === 'admin');
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // For development, simulate successful registration
      const mockUser = {
        id: '2',
        ...userData,
        role: 'user'
      };
      const mockToken = 'mock-jwt-token';
      
      setUser(mockUser);
      setIsAdmin(false);
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully!');
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};