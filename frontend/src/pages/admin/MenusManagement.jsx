
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Plus, Edit, Trash2, XCircle, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllMenus, createMenu, updateMenu, deleteMenu } from '../../services/menuService';
import { getAllPackages } from '../../services/packageService';

const MenusManagement = () => {
  const [menus, setMenus] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    package_id: '',
    name: '',
    items: [{ name: '' }],
    free_limit: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch menus and packages
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [menuData, packageData] = await Promise.all([getAllMenus(), getAllPackages()]);
        console.log('Fetched menus:', JSON.stringify(menuData, null, 2));
        menuData.forEach((menu) => {
          console.log(`Menu ${menu.name} (ID: ${menu.id}) items:`, JSON.stringify(menu.items, null, 2));
        });
        console.log('Fetched packages:', JSON.stringify(packageData, null, 2));
        setMenus(Array.isArray(menuData) ? menuData : []);
        setPackages(Array.isArray(packageData.packages) ? packageData.packages : packageData || []);
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setError('Failed to load menus or packages. Please try again.');
        toast.error(error.message);
        setMenus([]);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle item input changes
  const handleItemChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { name: value } : item)),
    }));
    setFormErrors((prev) => ({ ...prev, items: '' }));
  };

  // Add new item
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '' }],
    }));
  };

  // Remove item
  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Menu name is required';
    if (!formData.package_id) {
      errors.package_id = 'Package is required';
    } else if (!packages.find((pkg) => String(pkg.id) === String(formData.package_id))) {
      errors.package_id = 'Invalid package selected';
    }
    if (!formData.free_limit || parseInt(formData.free_limit) <= 0) {
      errors.free_limit = 'Free limit must be a positive number';
    }
    if (formData.items.length === 0) {
      errors.items = 'At least one menu item is required';
    } else {
      let itemErrors = [];
      formData.items.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
          itemErrors.push(`Item ${index + 1} is invalid`);
        } else if (!item.name?.trim()) {
          itemErrors.push(`Item ${index + 1}: Name is required`);
        }
      });
      if (itemErrors.length > 0) {
        errors.items = itemErrors.join('; ');
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form items before validation:', JSON.stringify(formData.items, null, 2));
    if (!validateForm()) {
      toast.error('Please fix form errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const menuData = {};
      if (formData.name.trim()) menuData.name = formData.name;
      if (formData.items.length > 0) menuData.items = formData.items;
      if (formData.free_limit) menuData.free_limit = parseInt(formData.free_limit);

      console.log('Submitting menu:', JSON.stringify(menuData, null, 2));

      if (formData.id) {
        if (!menus.find((m) => String(m.id) === String(formData.id))) {
          throw new Error('Menu not found in current list');
        }
        const response = await updateMenu(formData.id, formData.package_id, menuData);
        console.log('Update response:', JSON.stringify(response, null, 2));
        // Fallback: Refetch if response is incomplete
        if (!response.id) {
          console.warn('Incomplete update response, refetching menus');
          const updatedMenus = await getAllMenus();
          setMenus(updatedMenus);
        } else {
          setMenus((prev) =>
            prev.map((menu) =>
              String(menu.id) === String(formData.id)
                ? { ...menu, ...response, package_id: formData.package_id }
                : menu
            )
          );
        }
        toast.success('Menu updated successfully');
      } else {
        const response = await createMenu({ ...menuData, package_id: parseInt(formData.package_id) });
        console.log('Create response:', JSON.stringify(response, null, 2));
        // Fallback: Refetch if response is incomplete
        if (!response.id) {
          console.warn('Incomplete create response, refetching menus');
          const updatedMenus = await getAllMenus();
          setMenus(updatedMenus);
        } else {
          setMenus((prev) => [...prev, response]);
        }
        toast.success('Menu created successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving menu:', error.message);
      const errorMessage = error.message.includes('not found')
        ? 'Menu or package not found. Please refresh and try again.'
        : 'Failed to save menu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit menu
  const handleEdit = (menu) => {
    console.log('Editing menu:', JSON.stringify(menu, null, 2));
    const sanitizedItems = Array.isArray(menu.items) && menu.items.length > 0
      ? menu.items.map((item) => ({
          name: typeof item === 'string'
            ? item
            : item.name || item.itemName || item.title || item.item_name || item.dishName || item.description || '',
        }))
      : [{ name: '' }];
    setFormData({
      id: String(menu.id),
      package_id: String(menu.package_id),
      name: menu.name || '',
      items: sanitizedItems,
      free_limit: String(menu.free_limit || ''),
    });
    setShowForm(true);
  };

  // Handle delete menu
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteMenu(id);
      setMenus((prev) => prev.filter((menu) => String(menu.id) !== String(id)));
      setDeleteConfirm(null);
      toast.success('Menu deleted successfully');
    } catch (error) {
      console.error('Error deleting menu:', error.message);
      setError('Failed to delete menu');
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      package_id: '',
      name: '',
      items: [{ name: '' }],
      free_limit: '',
    });
    setFormErrors({});
    setShowForm(false);
  };

  // Handle click outside to close form
  const handleClickOutside = (e) => {
    if (showForm && e.target.className.includes('bg-gray-600')) {
      resetForm();
    }
  };

  if (loading && menus.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen" onClick={handleClickOutside}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Menu className="h-8 w-8 text-indigo-600 mr-2" />
            Menus Management
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Menu
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 p-4 rounded-lg flex items-center"
          >
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {menus.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Menus Found</h3>
            <p className="text-gray-500">No menus are currently available. Add a new menu to get started.</p>
          </div>
        )}

        {/* Menus Grid */}
        {menus.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu) => (
              <motion.div
                key={menu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Menu className="h-5 w-5 text-indigo-600 mr-2" />
                    {menu.name || 'Unnamed Menu'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Package: {packages.find((pkg) => String(pkg.id) === String(menu.package_id))?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Items:{' '}
                    {Array.isArray(menu.items) && menu.items.length > 0
                      ? menu.items
                          .map((item) =>
                            typeof item === 'string'
                              ? item
                              : item.name ||
                                item.itemName ||
                                item.title ||
                                item.item_name ||
                                item.dishName ||
                                item.description ||
                                'Unnamed Item'
                          )
                          .join(', ')
                      : 'None'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Free Limit:{' '}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {menu.free_limit || 'N/A'}
                    </span>
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(menu)}
                      className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                      title="Edit Menu"
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteConfirm(menu.id)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      title="Delete Menu"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Menu Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {formData.id ? 'Edit Menu' : 'Add New Menu'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Menu Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all duration-300 ${
                      formErrors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., Premium Menu"
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.name ? 1 : 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {formErrors.name}
                  </motion.p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Package</label>
                  <select
                    name="package_id"
                    value={formData.package_id}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all duration-300 ${
                      formErrors.package_id ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select a package</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.package_id ? 1 : 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {formErrors.package_id}
                  </motion.p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Menu Items</label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex space-x-2 mt-2 items-center">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all duration-300"
                        placeholder="Item name"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </div>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={addItem}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </motion.button>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.items ? 1 : 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {formErrors.items}
                  </motion.p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Free Limit</label>
                  <input
                    type="number"
                    name="free_limit"
                    value={formData.free_limit}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm transition-all duration-300 ${
                      formErrors.free_limit ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., 3"
                    min="0"
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.free_limit ? 1 : 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {formErrors.free_limit}
                  </motion.p>
                </div>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center"
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    )}
                    {loading ? 'Saving...' : formData.id ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this menu? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 flex items-center"
                >
                  {loading && (
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {loading ? 'Deleting...' : 'Delete'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenusManagement;
