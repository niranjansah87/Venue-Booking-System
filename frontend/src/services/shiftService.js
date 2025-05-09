import api from './api';

// Fetch all shifts
export const getAllShifts = async () => {
  try {
    const response = await api.get('/shifts');
    return response.data;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

// Fetch a single shift by ID
export const getShiftById = async (id) => {
  try {
    const response = await api.get(`/shifts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching shift with ID ${id}:`, error);
    throw error;
  }
};

// Create a new shift
export const createShift = async (shiftData) => {
  try {
    const response = await api.post('/shifts', shiftData);
    return response.data;
  } catch (error) {
    console.error('Error creating shift:', error);
    throw error;
  }
};

// Update a shift
export const updateShift = async (id, shiftData) => {
  try {
    const response = await api.put(`/shifts/${id}`, shiftData);
    return response.data;
  } catch (error) {
    console.error(`Error updating shift with ID ${id}:`, error);
    throw error;
  }
};

// Delete a shift
export const deleteShift = async (id) => {
  try {
    const response = await api.delete(`/shifts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting shift with ID ${id}:`, error);
    throw error;
  }
};