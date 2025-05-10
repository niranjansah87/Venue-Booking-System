import api from './api';

// Fetch all venues with optional pagination
export const getAllVenues = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/api/admin/venues', {
      params: { page, limit },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch venues';
    console.error('Error fetching venues:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Create a new venue
export const createVenue = async (venueData) => {
  try {
    const formData = new FormData();

    // Append all venue data
    Object.entries(venueData).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        // Ensure image is appended correctly
        formData.append('image', value);
      } else {
        formData.append(key, value);
      }
    });

    // Post the data to the backend API
    const response = await api.post('/api/admin/venues/create', formData, {
      withCredentials: true, // Send cookies (if needed)
      headers: { 'Content-Type': 'multipart/form-data' }, // This header ensures proper encoding
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create venue';
    console.error('Error creating venue:', errorMessage, error);
    throw new Error(errorMessage);
  }
};



// Update a venue
export const updateVenue = async (id, venueData) => {
  try {
    const formData = new FormData();
    // Append all venue data
    Object.entries(venueData).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        // Ensure image is appended correctly
        formData.append('image', value);
      } else {
        formData.append(key, value);
      }
    });

    const response = await api.put(`/api/admin/venues/update/${id}`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update venue with ID ${id}`;
    console.error(`Error updating venue with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Delete a venue
export const deleteVenue = async (id) => {
  try {
    const response = await api.delete(`/api/admin/venues/delete/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to delete venue with ID ${id}`;
    console.error(`Error deleting venue with ID ${id}:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};
