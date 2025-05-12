import React, { useState, useEffect } from 'react';
import { Utensils, PlusCircle, MinusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMenusByPackageId } from '../../../services/menuService';
import { toast } from 'react-toastify';

const MenuSelection = ({ packageId, selectedMenus, updateBookingData }) => {
  const [menus, setMenus] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      if (!packageId) {
        console.log('No packageId provided, skipping menu fetch.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching menus for packageId: ${packageId}`);
        const data = await getMenusByPackageId(packageId);
        console.log('Menu data received:', data);

        if (!Array.isArray(data)) {
          throw new Error('Invalid menu data format: Expected an array');
        }

        // Validate menu objects
        const validatedMenus = data.map((menu) => ({
          id: menu.id || null,
          name: menu.name || 'Unnamed Menu',
          free_limit: menu.free_limit || 0,
          items: Array.isArray(menu.items) ? menu.items : [],
        }));

        if (validatedMenus.length === 0) {
          setError('No menus available for this package.');
          toast.warn('No menus available for this package.');
        } else {
          setMenus(validatedMenus);
          setActiveMenu(validatedMenus[0]?.id || null);
        }
      } catch (error) {
        const errorMessage = error.message || 'Failed to load menus.';
        console.error('Error fetching menus:', errorMessage, error);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [packageId]);

  const handleMenuItemToggle = (menuId, itemIndex) => {
    const currentMenuItems = selectedMenus[menuId] || [];
    const updatedMenuItems = currentMenuItems.includes(itemIndex)
      ? currentMenuItems.filter((index) => index !== itemIndex)
      : [...currentMenuItems, itemIndex];

    updateBookingData('selectedMenus', {
      ...selectedMenus,
      [menuId]: updatedMenuItems,
    });
  };

  const getSelectedItemsCount = (menuId) => selectedMenus[menuId]?.length || 0;

  const isItemSelected = (menuId, itemIndex) =>
    selectedMenus[menuId]?.includes(itemIndex) || false;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 mb-4">No menus available for the selected package.</p>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Log menus before rendering
  console.log('Rendering menus:', menus);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Menu Options</h2>
      <p className="text-gray-600 mb-8">
        Customize your event menu by selecting items.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left - Menu Categories */}
        <div className="w-full lg:w-1/3">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Menu Categories</h3>
          <div className="space-y-2">
            {menus.map((menu) => (
              <motion.button
                key={menu.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  activeMenu === menu.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-600'
                }`}
              >
                {menu.name}
                <span className="ml-2 text-sm">
                  ({getSelectedItemsCount(menu.id)}/{menu.free_limit || 0} selected)
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right - Menu Items */}
        <div className="w-full lg:w-2/3">
          {activeMenu && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {menus.find((m) => m.id === activeMenu)?.name || 'Menu'} Options
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select up to {menus.find((m) => m.id === activeMenu)?.free_limit || 0} items at no extra charge.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(menus.find((m) => m.id === activeMenu)?.items || []).map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -3 }}
                    className={`p-4 border rounded-md flex items-center justify-between transition-all ${
                      isItemSelected(activeMenu, index)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-200'
                    }`}
                  >
                    <div>
                      <h4 className="text-gray-800 font-medium">{item.name || 'Unnamed Item'}</h4>
                    </div>
                    <button
                      onClick={() => handleMenuItemToggle(activeMenu, index)}
                      className={`p-2 rounded-full transition-colors ${
                        isItemSelected(activeMenu, index)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-primary-200 hover:text-primary-600'
                      }`}
                    >
                      {isItemSelected(activeMenu, index) ? (
                        <MinusCircle className="h-5 w-5" />
                      ) : (
                        <PlusCircle className="h-5 w-5" />
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {Object.keys(selectedMenus).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-5 bg-primary-50 border border-primary-100 rounded-md flex items-center"
        >
          <Utensils className="h-8 w-8 text-primary-500 mr-4" />
          <div>
            <p className="text-lg font-medium text-primary-800">Menu Items Selected</p>
            <p className="text-primary-600 mt-1">
              Proceed to review fare summary.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MenuSelection;