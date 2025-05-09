import api from './api';

// Get all bookings
export const getAllBookings = async () => {
  try {
    const response = await api.get('/bookings');
    
    // For development, return mock data
    const mockBookings = generateMockBookings();
    return { bookings: mockBookings };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// Generate mock bookings for development
const generateMockBookings = () => {
  const statuses = ['pending', 'confirmed', 'cancelled'];
  const venues = ['Royal Garden Hall', 'Lakeview Terrace', 'Grand Ballroom', 'Urban Loft'];
  const events = ['Wedding', 'Corporate Event', 'Birthday Party', 'Anniversary'];
  const bookings = [];
  
  // Generate bookings for the past 3 months
  const today = new Date();
  
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    
    bookings.push({
      id: `booking-${i + 1}`,
      date: date.toISOString(),
      guestCount: Math.floor(Math.random() * 300) + 20,
      eventType: events[Math.floor(Math.random() * events.length)],
      venue: venues[Math.floor(Math.random() * venues.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      totalFare: Math.floor(Math.random() * 50000) + 5000,
      customer: {
        name: `Customer ${i + 1}`,
        phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
        email: `customer${i + 1}@example.com`
      },
      createdAt: new Date(date.getTime() - Math.floor(Math.random() * 1000000)).toISOString()
    });
  }
  
  return bookings;
};

// Check venue availability for a specific date, venue, and shift
export const checkAvailability = async (date, venueId, shiftId) => {
  try {
    const response = await api.get('/bookings/check-availability', {
      params: { date, venueId, shiftId }
    });
    
    // For development, simulate availability check
    const mockResponse = {
      available: true,
      message: 'Venue is available for the selected date and shift'
    };
    
    return mockResponse;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

// Calculate booking fare
export const calculateFare = async (bookingData) => {
  try {
    const { packageId, selectedMenus, guestCount } = bookingData;
    
    // For development, simulate fare calculation
    const mockPackages = {
      '1': 5000,  // Basic package base price
      '2': 12000, // Premium package base price
      '3': 20000  // Deluxe package base price
    };
    
    const basePrice = mockPackages[packageId] || 5000;
    let extraCharges = 0;
    
    // Calculate extra charges for menu items exceeding free limit
    Object.entries(selectedMenus).forEach(([menuId, selectedItems]) => {
      const freeLimit = 3; // Mock free limit
      if (selectedItems.length > freeLimit) {
        const extraItems = selectedItems.length - freeLimit;
        extraCharges += extraItems * 200; // Mock price per extra item
      }
    });
    
    const totalFare = (basePrice + extraCharges) * guestCount;
    
    return {
      baseFare: basePrice * guestCount,
      extraCharges: extraCharges * guestCount,
      totalFare
    };
  } catch (error) {
    console.error('Error calculating fare:', error);
    throw error;
  }
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    // For development, simulate booking creation
    const mockBooking = {
      id: 'booking-' + Date.now(),
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    return { booking: mockBooking };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Delete booking
export const deleteBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};