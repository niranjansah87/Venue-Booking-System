import api from './api';

// Fetch all packages
export const getAllPackages = async () => {
  try {
    const response = await api.get('/api/admin/package');
    return response.data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
};

// Fetch a single package by ID
export const getPackageById = async (id) => {
  try {
    const response = await api.get(`/api/admin/packages/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching package with ID ${id}:`, error);
    throw error;
  }
};

// Create a new package
export const createPackage = async (packageData) => {
  try {
    const response = await api.post('/api/admin/package/create', packageData);
    return response.data;
  } catch (error) {
    console.error('Error creating package:', error);
    throw error;
  }
};

// Update a package
export const updatePackage = async (id, packageData) => {
  try {
    const response = await api.put(`/api/admin/package/update/${id}`, packageData);
    return response.data;
  } catch (error) {
    console.error(`Error updating package with ID ${id}:`, error);
    throw error;
  }
};

// Delete a package
export const deletePackage = async (id) => {
  try {
    const response = await api.delete(`/api/admin/package/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting package with ID ${id}:`, error);
    throw error;
  }
};