import React from 'react';
import { Bell, Menu, User, ChevronDown, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminHeader = ({ 
  toggleSidebar, 
  userMenuOpen, 
  setUserMenuOpen, 
  user, 
  handleLogout 
}) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4 md:px-6">
      {/* Left section with mobile menu button */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-600 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 ml-4 md:ml-0">Admin Panel</h1>
      </div>
      
      {/* Right section with notifications and profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-1 text-gray-500 hover:text-gray-600 transition-colors">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-error-500 border-2 border-white rounded-full"></span>
        </button>
        
        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden md:flex md:items-center">
              <span className="text-sm font-medium text-gray-700 mr-1">
                {user?.name || 'Admin User'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </button>
          
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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