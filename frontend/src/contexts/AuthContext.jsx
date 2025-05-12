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
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        try {
          // Parse stored user data
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/admin/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success('Logged in successfully!');
      navigate('/booking');
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully!');
  };

  const sendOtp = async () => {
    if (!user?.id || !user?.email) {
      toast.error('User details not found. Please log in.');
      throw new Error('User details not found');
    }
    try {
      await api.post('/api/admin/book/send-otp', { userId: user.id, email: user.email });
      toast.success('OTP sent to your email!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP.');
      throw error;
    }
  };

  const verifyOtp = async (otp) => {
    if (!user?.id || !user?.name) {
      toast.error('User details not found. Please log in.');
      throw new Error('User details not found');
    }
    try {
      await api.post('/api/admin/book/step3', { userId: user.id, otp, name: user.name });
      toast.success('OTP verified successfully!');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Invalid OTP.');
      throw error;
    }
  };

  const sendBookingConfirmationEmail = async (bookingId, email) => {
    try {
      await api.post('/api/admin/bookings/send-confirmation', { bookingId, email });
      toast.success('Confirmation email sent!');
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      toast.error('Failed to send confirmation email.');
      throw error;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, sendOtp, verifyOtp, sendBookingConfirmationEmail, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);