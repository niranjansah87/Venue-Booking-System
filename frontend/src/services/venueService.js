import api from './api';

// Fetch all venues with optional pagination
export const getAllVenues = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`api/admin/venues`);
    return response.data;
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }
};

// Fetch a single venue by ID
export const getVenueById = async (id) => {
  try {
    const response = await api.get(`/api/admin/venues/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching venue with ID ${id}:`, error);
    throw error;
  }
};

// Create a new venue
export const createVenue = async (venueData) => {
  try {
    // Create FormData for file upload if an image is included
    const formData = new FormData();
    
    for (const key in venueData) {
      if (key === 'image' && venueData[key] instanceof File) {
        formData.append(key, venueData[key]);
      } else {
        formData.append(key, venueData[key]);
      }
    }
    
    const response = await api.post('/api/admin/venues/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating venue:', error);
    throw error;
  }
};

// Update a venue
export const updateVenue = async (id, venueData) => {
  try {
    // Create FormData for file upload if an image is included
    const formData = new FormData();
    
    for (const key in venueData) {
      if (key === 'image' && venueData[key] instanceof File) {
        formData.append(key, venueData[key]);
      } else {
        formData.append(key, venueData[key]);
      }
    }
    
    const response = await api.put(`/api/admin/venues/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating venue with ID ${id}:`, error);
    throw error;
  }
};

// Delete a venue
export const deleteVenue = async (id) => {
  try {
    const response = await api.delete(`api/admin/venues/delete${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting venue with ID ${id}:`, error);
    throw error;
  }
};