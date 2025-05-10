import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedLayout from './layouts/ProtectedLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import BookingPage from './pages/public/BookingPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ProfilePage from './pages/public/ProfilePage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import BookingsManagement from './pages/admin/BookingsManagement';
import VenuesManagement from './pages/admin/VenuesManagement';
import ShiftsManagement from './pages/admin/ShiftsManagement';
import PackagesManagement from './pages/admin/PackagesManagement';
import MenusManagement from './pages/admin/MenusManagement';
import UsersManagement from './pages/admin/UsersManagement';
import AdminProfilePage from './pages/public/AdminProfilePage';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error: error.message || 'An error occurred' };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700">{this.state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* ---------------- Public Routes ---------------- */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route
            path="login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
        </Route>

        {/* ---------------- Protected User Routes ---------------- */}
        <Route element={<ProtectedLayout />}>
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ---------------- Admin Login Route (Unprotected) ---------------- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ---------------- Admin Routes (Protected) ---------------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookings" element={<BookingsManagement />} />
          <Route path="venues" element={<VenuesManagement />} />
          <Route path="shifts" element={<ShiftsManagement />} />
          <Route path="packages" element={<PackagesManagement />} />
          <Route path="menus" element={<MenusManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* ---------------- Catch-all Route ---------------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;