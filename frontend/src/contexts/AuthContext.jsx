import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (!userData.id || !userData.email || !userData.name) {
            throw new Error('Invalid user data in localStorage');
          }
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/login', { email, password });
      const { user } = response.data;

      if (!user || typeof user !== 'object') {
        throw new Error('No user data received from server');
      }
      if (!user.id || !user.email || !user.name) {
        throw new Error('User data missing required fields (id, email, name)');
      }

      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Logged in successfully!');
      navigate('/booking');
    } catch (error) {
      console.error('Error logging in:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully!');
  };

  const sendOtp = async () => {
    if (!user?.id || !user?.email) {
      toast.error('Please log in to send OTP.');
      throw new Error('User details not found');
    }
    try {
      await api.post('/send-otp', { userId: user.id, email: user.email });
      toast.success('OTP sent to your email!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
      throw error;
    }
  };

  const verifyOtp = async (otp) => {
    if (!user?.id || !user?.name) {
      toast.error('Please log in to verify OTP.');
      throw new Error('User details not found');
    }
    try {
      await api.post('/step3', { userId: user.id, otp, name: user.name });
      toast.success('OTP verified successfully!');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP.');
      throw error;
    }
  };

  const sendConfirmation = async (bookingId, email) => {
    try {
      await api.post('/send-confirmation', { bookingId, email });
      toast.success('Confirmation email sent!');
    } catch (error) {
      console.error('Error sending confirmation:', error);
      toast.error(error.response?.data?.message || 'Failed to send confirmation email.');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, sendOtp, verifyOtp, sendConfirmation, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);