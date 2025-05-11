
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaCoffee, FaSignOutAlt } from 'react-icons/fa';
import api from '../../services/api';

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get and memoize user from localStorage
  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
      return null;
    }
  }, []);

  // Check authentication and load user data
  useEffect(() => {
    if (!user?.id) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    setProfile(user);
    setFormData({ name: user.name || '', email: user.email || '' });
    setLoading(false);
  }, [user, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required.');
      toast.error('Name and email are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      const response = await api.put(`/api/user/update/${user.id}`, {
        name: formData.name,
        email: formData.email,
      });
      const updatedUser = {
        ...user,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role || user.role,
      };
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Trigger storage event to notify AdminHeader
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(updatedUser),
        })
      );
      setProfile(updatedUser);
      setIsEditing(false);
      setSuccessMessage(response.data.message || 'Profile updated successfully');
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Update user error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('user');
        navigate('/login', { state: { from: '/profile' } });
      }
      setFormError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setFormError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <FaCoffee className="text-teal-600 text-2xl group-hover:text-teal-500 transition-colors duration-200" />
            <h1 className="text-2xl font-extrabold text-teal-600 group-hover:text-teal-500 transition-colors duration-200">
              A One Cafe
            </h1>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(94,234,212,0.1)_0%,_transparent_50%)] z-0" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-teal-100/50 relative overflow-hidden"
        >
          {/* Decorative Gradient Border */}
          <div className="absolute inset-0 border-2 border-transparent rounded-3xl bg-gradient-to-r from-teal-400 to-cyan-500 opacity-20" />

          {loading ? (
            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"
              />
            </div>
          ) : error ? (
            <p className="text-red-600 text-center font-medium">{error}</p>
          ) : (
            <div className="space-y-6 relative z-10">
              {/* Avatar */}
              <motion.div
                className="flex justify-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <img
                    src="/avatar.png"
                    alt="User Avatar"
                    className="w-28 h-28 rounded-full object-cover border-4 border-gradient-to-r from-teal-400 to-cyan-500 shadow-lg"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 opacity-30"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-3xl font-extrabold text-gray-900 text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isEditing ? 'Edit Profile' : 'Your Profile'}
              </motion.h2>

              {/* Success Message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-teal-50 border-l-4 border-teal-500 text-teal-700 p-4 rounded-lg shadow-sm"
                  >
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isEditing ? (
                <motion.div
                  className="space-y-5 text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <p className="text-sm font-medium text-teal-600">Name</p>
                      <p className="text-lg font-semibold">{profile?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <p className="text-sm font-medium text-teal-600">Email</p>
                      <p className="text-lg font-semibold">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <p className="text-sm font-medium text-teal-600">Role</p>
                      <p className="text-lg font-semibold capitalize">{profile?.role}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(20, 184, 166, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleEdit}
                    className="w-full py-3 px-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-all shadow-md"
                  >
                    Edit Profile
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <AnimatePresence>
                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border-l-4 border-red-500 text-red-600 p-4 rounded-lg shadow-sm"
                      >
                        {formError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <motion.input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-2 block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition-all shadow-sm"
                      placeholder="Enter your name"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <motion.input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-2 block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition-all shadow-sm"
                      placeholder="Enter your email"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(20, 184, 166, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="flex-1 py-3 px-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-all shadow-md"
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(107, 114, 128, 0.2)' }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={toggleEdit}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all shadow-md"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ProfilePage;
