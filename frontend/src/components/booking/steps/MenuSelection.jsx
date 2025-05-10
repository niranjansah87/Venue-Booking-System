import React, { useState, useEffect } from 'react';
import { Utensils, PlusCircle, MinusCircle, Check, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMenusByPackageId } from '../../../services/menuService';
import { toast } from 'react-toastify';

const MenuSelection = ({ selectedPackage, selectedMenus, updateBookingData, sessionId }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      if (!selectedPackage) return;
      try {
        setLoading(true);
        const data = await getMenusByPackageId(selectedPackage, sessionId);
        setMenus(data);
        setActiveMenu(data[0]?.id || null);
      } catch (error) {
        console.error('Error fetching menus:', error);
        setError('Failed to load menu options. Please try again.');
        toast.error('Failed to load menu options.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, [selectedPackage, sessionId]);

  const handleMenuItemToggle = (menuId, itemIndex) => {
    const currentMenuItems = selectedMenus[menuId] || [];
    let updatedMenuItems;

    if (currentMenuItems.includes(itemIndex)) {
      updatedMenuItems = currentMenuItems.filter((index) => index !== itemIndex);
    } else {
      updatedMenuItems = [...currentMenuItems, itemIndex];
    }

    updateBookingData('selectedMenus', {
      ...selectedMenus,
      [menuId]: updatedMenuItems,
    });
  };

  const getSelectedItemsCount = (menuId) => {
    return selectedMenus[menuId]?.length || 0;
  };

  const isItemSelected = (menuId, itemIndex) => {
    return selectedMenus[menuId]?.includes(itemIndex) || false;
  };

  const getMenuById = (menuId) => {
    return menus.find((menu) => menu.id === menuId);
  };

  const getFreeLimitMessage = (menuId) => {
    const menu = getMenuById(menuId);
    if (!menu) return '';
    const selectedCount = getSelectedItemsCount(menuId);
    const freeLimit = menu.free_limit || 0;
    if (selectedCount <= freeLimit) {
      return `Select up to ${freeLimit} items at no extra charge (${selectedCount}/${freeLimit} selected)`;
    } else {
      return `You've selected ${selectedCount} items (${freeLimit} free + ${selectedCount - freeLimit} extra)`;
    }
  };

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
        <p className="text-error-500 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!selectedPackage) {
    return (
      <div className="py-8 text-center">
        <p className="text-warning-600 mb-4">Please select a package first</p>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          onClick={() => window.history.back()}
        >
          Go Back to Package Selection
        </button>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 mb-4">No menu options available for the selected package.</p>
      </div>
    );
  }

  const activeMenuData = getMenuById(activeMenu);

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Menu Items</h2>
      <p className="text-gray-600 mb-8">
        Choose your preferred items from each menu category. Each category has a free selection limit.
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Menu Categories</h3>
            <ul className="space-y-2">
              {menus.map((menu) => {
                const selectedCount = getSelectedItemsCount(menu.id);
                const isOverLimit = selectedCount > (menu.free_limit || 0);
                return (
                  <li key={menu.id}>
                    <button
                      onClick={() => setActiveMenu(menu.id)}
                      className={`w-full text-left px-4 py-3 rounded-md flex items-center justify-between transition-colors ${
                        activeMenu === menu.id ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <Utensils className={`h-5 w-5 mr-3 ${activeMenu === menu.id ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className="font-medium">{menu.name}</span>
                      </div>
                      <div className={`flex items-center text-sm ${isOverLimit ? 'text-warning-600' : 'text-success-600'}`}>
                        {selectedCount > 0 && (
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-1 ${isOverLimit ? 'bg-warning-100' : 'bg-success-100'}`}>
                            {selectedCount}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 p-3 bg-primary-50 border border-primary-100 rounded-md">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-primary-700">
                  Items selected beyond the free limit will incur additional charges.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              {activeMenuData && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium text-gray-800">{activeMenuData.name}</h3>
                    <div className={`text-sm px-3 py-1 rounded-full ${
                      getSelectedItemsCount(activeMenu) > activeMenuData.free_limit ? 'bg-warning-50 text-warning-700' : 'bg-success-50 text-success-700'
                    }`}>
                      {getFreeLimitMessage(activeMenu)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeMenuData.items?.map((item, index) => {
                      const isSelected = isItemSelected(activeMenu, index);
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleMenuItemToggle(activeMenu, index)}
                          className={`p-3 rounded-md border cursor-pointer flex items-center justify-between ${
                            isSelected ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            {isSelected ? (
                              <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center mr-3">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3"></div>
                            )}
                            <span className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-800'}`}>
                              {item.name}
                            </span>
                          </div>
                          <span className={`text-sm ${isSelected ? 'text-primary-700' : 'text-gray-500'}`}>
                            ${item.price}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-medium text-gray-800 mb-3">Your Selections</h4>
            {Object.keys(selectedMenus).length === 0 ? (
              <p className="text-gray-500">You haven't selected any menu items yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(selectedMenus).map(([menuId, itemIndexes]) => {
                  if (itemIndexes.length === 0) return null;
                  const menu = getMenuById(menuId);
                  if (!menu) return null;
                  return (
                    <div key={menuId} className="border-b border-gray-200 pb-3 last:border-0">
                      <p className="font-medium text-gray-800">{menu.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {itemIndexes.map((itemIndex) => {
                          const item = menu.items[itemIndex];
                          if (!item) return null;
                          return (
                            <div key={itemIndex} className="text-sm bg-white px-2 py-1 rounded border border-gray-200 flex items-center">
                              <span>{item.name}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMenuItemToggle(menuId, itemIndex);
                                }}
                                className="ml-2 text-gray-400 hover:text-error-500 transition-colors"
                              >
                                <MinusCircle className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div className="mt-3">
                  <p className="text-sm text-primary-600">
                    Additional charges may apply for selections exceeding the free limit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuSelection;