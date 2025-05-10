import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === 'admin');
      api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/admin/login', { email, password }, { withCredentials: true });
      const { admin } = response.data;
      setUser(admin);
      setIsAdmin(true);
      sessionStorage.setItem('userData', JSON.stringify(admin));
      api.defaults.headers.common['Authorization'] = `Bearer ${admin.token}`;
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    sessionStorage.removeItem('userData');
    delete api.defaults.headers.common['Authorization'];
    navigate('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
