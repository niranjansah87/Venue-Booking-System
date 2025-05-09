import api from './api';

// Fetch all users with pagination
export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Fetch a single user by ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

// Update a user
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (id, role) => {
  try {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    console.error(`Error updating role for user with ID ${id}:`, error);
    throw error;
  }
};