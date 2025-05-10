import api from './api';

// Get all bookings
export const getAllBookings = async () => {
  try {
    const response = await api.get('/api/admin/bookings', { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch bookings';
    console.error('Error fetching bookings:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Check venue availability for a specific date, venue, and shift
export const checkAvailability = async (eventId, venueId, shiftId, eventDate, guestCount, sessionId) => {
  try {
    const response = await api.post(
      '/api/admin/bookings/check-availability',
      { event_id: eventId, venue_id: venueId, shift_id: shiftId, event_date: eventDate, guest_count: guestCount, sessionId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to check availability';
    console.error('Error checking availability:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Calculate booking fare
export const calculateFare = async (bookingData) => {
  try {
    const response = await api.post('/api/admin/bookings/calculate-fare', bookingData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to calculate fare';
    console.error('Error calculating fare:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/admin/bookings/store', bookingData, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create booking';
    console.error('Error creating booking:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    const response = await api.patch(`/api/admin/bookings/${bookingId}/status`, { status: newStatus }, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to update booking status for ID ${bookingId}`;
    console.error('Error updating booking status:', errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Delete booking
export const deleteBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/api/admin/bookings/${bookingId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to delete booking with ID ${bookingId}`;
    console.error('Error deleting booking:', errorMessage, error);
    throw new Error(errorMessage);
  }
};