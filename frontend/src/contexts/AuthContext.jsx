import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/admin/users');
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const sendOtp = async (email) => {
    try {
      await api.post('/api/admin/book/send-otp', { email: user.email });
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP.');
      throw error;
    }
  };

  const verifyOtp = async (otp) => {
    try {
      await api.post('/api/admin/book/step3', { otp, sessionId });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Invalid OTP.');
      throw error;
    }
  };

  const sendBookingConfirmationEmail = async (bookingId, email) => {
    try {
      await api.post('/api/admin/bookings/send-confirmation', { bookingId, email });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      toast.error('Failed to send confirmation email.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, sendOtp, verifyOtp, sendBookingConfirmationEmail, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);