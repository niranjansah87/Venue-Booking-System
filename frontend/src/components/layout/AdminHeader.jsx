import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, User, ChevronDown, LogOut, User2, Settings, Calendar, LayoutDashboard, MapPin, Clock, Tag, Utensils, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminHeader = ({ 
  toggleSidebar, 
  userMenuOpen, 
  setUserMenuOpen, 
  user, 
  handleLogout,
  sidebarOpen,
}) => {
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { name: 'Venues', path: '/admin/venues', icon: MapPin },
    { name: 'Shifts', path: '/admin/shifts', icon: Clock },
    { name: 'Packages', path: '/admin/packages', icon: Tag },
    { name: 'Menus', path: '/admin/menus', icon: Utensils },
    { name: 'Users', path: '/admin/users', icon: Users },
    
  ];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-20 bg-gradient-to-r from-primary-600 to-primary-700 px-4 md:px-8 backdrop-blur-xs shadow-lg">
      {/* Left section with mobile menu button and title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="text-white hover:text-primary-400 transition-colors md:hidden"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          title={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <Menu className="h-8 w-8" />
        </button>
        <h1 className="text-2xl font-extrabold text-white flex items-center">
          <Calendar className="h-7 w-7 text-primary-400 mr-2" />
          Admin Dashboard
        </h1>
      </div>
      
      {/* Right section with navigation, notifications, and profile */}
      <div className="flex items-center space-x-6">
        {/* Condensed navigation (desktop) */}
        <nav className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center text-white hover:text-primary-400 text-sm font-medium transition-colors"
              title={item.name}
            >
              <item.icon className="h-5 w-5 mr-1" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        {/* Notifications */}
        <button 
          className="relative p-2 text-white hover:text-primary-400 transition-colors"
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell className="h-7 w-7" />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1 right-1 inline-block w-3 h-3 bg-error-500 border-2 border-white rounded-full"
          ></motion.span>
        </button>
        
        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 focus:outline-none"
            aria-label="Toggle user menu"
            aria-expanded={userMenuOpen}
            title="User menu"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-800 flex items-center justify-center text-white border-2 border-primary-400 hover:shadow-glow transition-all duration-300">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="User avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                </span>
              )}
            </div>
            <div className="hidden md:flex md:items-center">
              <span className="text-base font-semibold text-white mr-1">
                {user?.name || 'Admin User'}
              </span>
              <ChevronDown className="h-5 w-5 text-white" />
            </div>
          </button>
          
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200/50"
              >
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                </div>
                <Link
                  to="/admin/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <User2 className="h-4 w-4 mr-2" />
                  Your Profile
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50 hover:text-error-700 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;