import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const MenuSelection = ({ selectedMenus, updateBookingData }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await api.get('/api/admin/menus');
        setMenus(response.data.menus || []);
      } catch (error) {
        console.error('Error fetching menus:', error);
        toast.error('Failed to load menus.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const handleMenuChange = (menuId) => {
    updateBookingData('selectedMenus', {
      ...selectedMenus,
      [menuId]: !selectedMenus[menuId],
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Menus</h2>
      <p className="text-gray-600 mb-8">Choose the menus for your event.</p>

      {loading ? (
        <p>Loading menus...</p>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            {menus.map((menu) => (
              <motion.label
                key={menu.id}
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="checkbox"
                  checked={!!selectedMenus[menu.id]}
                  onChange={() => handleMenuChange(menu.id)}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-800">{menu.name} - ${menu.price}</span>
              </motion.label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuSelection;