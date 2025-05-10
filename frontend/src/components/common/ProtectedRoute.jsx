import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/api/check-session');
        setIsAuthenticated(true);
        setUserRole(response.data.user.role);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (err) {
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    };
    checkSession();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={adminOnly ? '/admin/login' : '/login'} state={{ from: window.location.pathname }} replace />;
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;