
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Plus, Edit, Trash2, XCircle, CheckCircle, AlertCircle, X } from 'lucide-react';
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
    items: [{ name: '', price: '' }],
    free_limit: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Mock data for preview
  const mockPackages = [
    { id: 1, name: 'Basic Package' },
    { id: 2, name: 'Premium Package' },
    { id: 3, name: 'Luxury Package' },
  ];

  const mockMenus = [
    {
      id: 1,
      package_id: 1,
      name: 'Basic Menu',
      items: [
        { name: 'Chicken Salad', price: 10 },
        { name: 'Pasta', price: 12 },
      ],
      free_limit: 2,
      created_at: '2025-05-01T10:00:00Z',
      updated_at: '2025-05-01T10:00:00Z',
    },
    {
      id: 2,
      package_id: 2,
      name: 'Premium Menu',
      items: [
        { name: 'Steak', price: 20 },
        { name: 'Grilled Salmon', price: 18 },
        { name: 'Cheesecake', price: 8 },
      ],
      free_limit: 3,
      created_at: '2025-05-01T10:00:00Z',
      updated_at: '2025-05-01T10:00:00Z',
    },
  ];

  // Fetch menus and packages
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuData, packageData] = await Promise.all([getAllMenus(), getAllPackages()]);
      setMenus(Array.isArray(menuData) && menuData.length ? menuData : mockMenus);
      setPackages(packageData.packages?.length > 0 ? packageData.packages : mockPackages);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load menus or packages');
      setMenus(mockMenus);
      setPackages(mockPackages);
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
  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    setFormErrors((prev) => ({ ...prev, items: '' }));
  };

  // Add new item
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', price: '' }],
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
    if (!formData.package_id) errors.package_id = 'Package is required';
    if (!formData.free_limit || formData.free_limit <= 0) {
      errors.free_limit = 'Free limit must be a positive number';
    }
    if (formData.items.length === 0) {
      errors.items = 'At least one menu item is required';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.name.trim()) {
          errors.items = 'All item names are required';
        }
        if (!item.price || item.price <= 0) {
          errors.items = 'All item prices must be positive numbers';
        }
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const menuData = {
        package_id: parseInt(formData.package_id),
        name: formData.name,
        items: formData.items.map((item) => ({
          name: item.name,
          price: parseFloat(item.price),
        })),
        free_limit: parseInt(formData.free_limit),
      };

      if (formData.id) {
        // Update menu
        const response = await updateMenu(formData.id, menuData);
        setMenus((prev) =>
          prev.map((menu) => (menu.id === formData.id ? { ...menu, ...response } : menu))
        );
      } else {
        // Create menu
        const response = await createMenu(menuData);
        setMenus((prev) => [...prev, response]);
      }

      resetForm();
    } catch (error) {
      setError('Failed to save menu');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit menu
  const handleEdit = (menu) => {
    setFormData({
      id: menu.id,
      package_id: menu.package_id.toString(),
      name: menu.name,
      items: menu.items.length > 0 ? menu.items : [{ name: '', price: '' }],
      free_limit: menu.free_limit.toString(),
    });
    setShowForm(true);
  };

  // Handle delete menu
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteMenu(id);
      setMenus((prev) => prev.filter((menu) => menu.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      setError('Failed to delete menu');
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
      items: [{ name: '', price: '' }],
      free_limit: '',
    });
    setFormErrors({});
    setShowForm(false);
  };

  if (loading && menus.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Menu className="h-8 w-8 text-primary-600 mr-2" />
            Menus Management
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Menu
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-error-50 p-4 rounded-lg flex items-center"
          >
            <XCircle className="h-5 w-5 text-error-500 mr-2" />
            <p className="text-sm text-error-700">{error}</p>
          </motion.div>
        )}

        {/* Menus Grid */}
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
                  <Menu className="h-5 w-5 text-primary-600 mr-2" />
                  {menu.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Package: {packages.find((pkg) => pkg.id === menu.package_id)?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Items: {menu.items.map((item) => item.name).join(', ')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Free Limit:{' '}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {menu.free_limit}
                  </span>
                </p>
                <div className="mt-4 flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(menu)}
                    className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700"
                    title="Edit Menu"
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteConfirm(menu.id)}
                    className="p-2 bg-error-600 text-white rounded-full hover:bg-error-700"
                    title="Delete Menu"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300 ${
                      formErrors.name ? 'border-error-500' : ''
                    }`}
                    placeholder="e.g., Premium Menu"
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.name ? 1 : 0 }}
                    className="mt-1 text-sm text-error-500"
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
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300 ${
                      formErrors.package_id ? 'border-error-500' : ''
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
                    className="mt-1 text-sm text-error-500"
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
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300"
                        placeholder="Item name"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300"
                        placeholder="Price"
                        step="0.01"
                        min="0"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-error-600 hover:text-error-700"
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
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </motion.button>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.items ? 1 : 0 }}
                    className="mt-1 text-sm text-error-500"
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
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm transition-all duration-300 ${
                      formErrors.free_limit ? 'border-error-500' : ''
                    }`}
                    placeholder="e.g., 3"
                    min="0"
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: formErrors.free_limit ? 1 : 0 }}
                    className="mt-1 text-sm text-error-500"
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
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 flex items-center"
                  >
                    {loading ? (
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : null}
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
                <AlertCircle className="h-6 w-6 text-error-500 mr-2" />
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-error-600 hover:bg-error-700 flex items-center"
                >
                  {loading ? (
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : null}
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
