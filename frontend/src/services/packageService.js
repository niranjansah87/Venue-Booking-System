import api from './api';

// Fetch all packages
export const getAllPackages = async () => {
  try {
    const response = await api.get('/packages');
    return response.data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
};

// Fetch a single package by ID
export const getPackageById = async (id) => {
  try {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching package with ID ${id}:`, error);
    throw error;
  }
};

// Create a new package
export const createPackage = async (packageData) => {
  try {
    const response = await api.post('/packages', packageData);
    return response.data;
  } catch (error) {
    console.error('Error creating package:', error);
    throw error;
  }
};

// Update a package
export const updatePackage = async (id, packageData) => {
  try {
    const response = await api.put(`/packages/${id}`, packageData);
    return response.data;
  } catch (error) {
    console.error(`Error updating package with ID ${id}:`, error);
    throw error;
  }
};

// Delete a package
export const deletePackage = async (id) => {
  try {
    const response = await api.delete(`/packages/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting package with ID ${id}:`, error);
    throw error;
  }
};