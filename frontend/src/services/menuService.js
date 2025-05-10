import api from './api';

// Fetch all menus
export const getAllMenus = async () => {
  try {
    const response = await api.get('/api/admin/menus');
    return response.data;
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw error;
  }
};

// Fetch menus by package ID
export const getMenusByPackageId = async (packageId) => {
  try {
    const response = await api.get(`/menus/package/${packageId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menus for package ID ${packageId}:`, error);
    throw error;
  }
};

// Fetch a single menu by ID
export const getMenuById = async (id) => {
  try {
    const response = await api.get(`/menus/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu with ID ${id}:`, error);
    throw error;
  }
};

// Create a new menu
export const createMenu = async (menuData) => {
  try {
    const response = await api.post('/api/admin/menus/create', menuData);
    return response.data;
  } catch (error) {
    console.error('Error creating menu:', error);
    throw error;
  }
};

// Update a menu
export const updateMenu = async (id, menuData) => {
  try {
    const response = await api.put(`/api/admin/menus/update/${id}`, menuData);
    return response.data;
  } catch (error) {
    console.error(`Error updating menu with ID ${id}:`, error);
    throw error;
  }
};

// Delete a menu
export const deleteMenu = async (id) => {
  try {
    const response = await api.delete(`/api/admin/menus/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting menu with ID ${id}:`, error);
    throw error;
  }
};