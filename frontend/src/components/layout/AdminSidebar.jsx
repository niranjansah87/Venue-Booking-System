import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  MapPin, 
  Clock, 
  Tag, 
  Utensils, 
  Users, 
  Settings,
  X
} from 'lucide-react';

const AdminSidebar = ({ mobile = false, onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { name: 'Venues', path: '/admin/venues', icon: MapPin },
    { name: 'Event Types', path: '/admin/events', icon: Tag },
    { name: 'Shifts', path: '/admin/shifts', icon: Clock },
    { name: 'Packages', path: '/admin/packages', icon: Tag },
    { name: 'Menus', path: '/admin/menus', icon: Utensils },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Profile', path: '/admin/profile', icon: Settings },
  ];
  
  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {mobile && (
        <div className="px-4 py-5 flex items-center justify-between border-b border-gray-800">
          <span className="text-xl font-bold">Admin Panel</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      <div className={`flex items-center justify-center p-6 ${mobile ? '' : 'border-b border-gray-800'}`}>
        <div className="flex items-center space-x-2">
          <Calendar className="h-8 w-8 text-primary-400" />
          <span className="text-xl font-heading font-bold">Elegance Venues</span>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-primary-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
              `}
              onClick={mobile && onClose}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-400">Admin Panel v1.0</p>
      </div>
    </div>
  );
};

export default AdminSidebar;