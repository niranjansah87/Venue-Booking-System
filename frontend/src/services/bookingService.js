import api from './api';

// Get all bookings
export const getAllBookings = async () => {
  try {
    const response = await api.get('/api/admin/bookings');
    return response.data; // Assuming the backend returns { bookings: [...] }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// Check venue availability for a specific date, venue, and shift
export const checkAvailability = async (date, venueId, shiftId) => {
  try {
    const response = await api.get('/api/admin/bookings/check-availability', {
      params: { date, venueId, shiftId }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

// Calculate booking fare
export const calculateFare = async (bookingData) => {
  try {
    const response = await api.post('/api/admin/bookings/calculate-fare', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error calculating fare:', error);
    throw error;
  }
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/admin/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    const response = await api.patch(`/api/admin/bookings/${bookingId}/status`, { status: newStatus });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Delete booking
export const deleteBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/api/admin/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};
