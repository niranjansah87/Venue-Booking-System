import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // For development, simulate successful API calls
    if (config.method === 'get') {
      // Mock data based on endpoint
      const mockData = getMockData(config.url);
      return Promise.resolve({ data: mockData });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock data helper function
const getMockData = (url) => {
  if (url.includes('/events')) {
    return {
      events: [
        { id: '1', name: 'Wedding', icon: 'heart' },
        { id: '2', name: 'Corporate Event', icon: 'briefcase' },
        { id: '3', name: 'Birthday Party', icon: 'cake' },
        { id: '4', name: 'Anniversary', icon: 'gift' },
        { id: '5', name: 'Conference', icon: 'users' },
        { id: '6', name: 'Engagement', icon: 'ring' }
      ]
    };
  }
  
  if (url.includes('/venues')) {
    return {
      venues: [
        {
          id: '1',
          name: 'Royal Garden Hall',
          image: 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg',
          capacity: 350,
          location: 'Downtown',
          rating: 4.8,
          description: 'An elegant venue with beautiful garden views, perfect for weddings and formal events.'
        },
        {
          id: '2',
          name: 'Lakeview Terrace',
          image: 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg',
          capacity: 150,
          location: 'Waterfront',
          rating: 4.5,
          description: 'A stunning waterfront location with panoramic lake views and modern amenities.'
        },
        {
          id: '3',
          name: 'Grand Ballroom',
          image: 'https://images.pexels.com/photos/3319332/pexels-photo-3319332.jpeg',
          capacity: 500,
          location: 'City Center',
          rating: 4.9,
          description: 'Our largest and most prestigious venue, featuring crystal chandeliers and marble floors.'
        }
      ]
    };
  }
  
  if (url.includes('/shifts')) {
    return {
      shifts: [
        { id: '1', name: 'Morning (8:00 AM - 12:00 PM)', startTime: '08:00', endTime: '12:00' },
        { id: '2', name: 'Afternoon (1:00 PM - 5:00 PM)', startTime: '13:00', endTime: '17:00' },
        { id: '3', name: 'Evening (6:00 PM - 10:00 PM)', startTime: '18:00', endTime: '22:00' },
        { id: '4', name: 'Full Day (10:00 AM - 10:00 PM)', startTime: '10:00', endTime: '22:00' }
      ]
    };
  }
  
  if (url.includes('/packages')) {
    return {
      packages: [
        {
          id: '1',
          name: 'Basic',
          base_price: 5000,
          description: 'Essential services for a simple event',
          features: ['Standard decoration', 'Basic sound system', 'Standard lighting', 'Basic seating arrangement'],
          recommended: false,
          category: 'budget'
        },
        {
          id: '2',
          name: 'Premium',
          base_price: 12000,
          description: 'Enhanced services with premium features',
          features: ['Premium decoration', 'Advanced sound system', 'Mood lighting', 'Premium seating with covers', 'Photography service', 'Welcome drinks'],
          recommended: true,
          category: 'premium'
        },
        {
          id: '3',
          name: 'Deluxe',
          base_price: 20000,
          description: 'Complete solution with luxury amenities',
          features: ['Luxury decoration', 'Professional sound system', 'Dynamic lighting setup', 'Premium seating with covers', 'Photography & videography', 'Welcome drinks & mocktails', 'VIP reception area', '2-tier cake'],
          recommended: false,
          category: 'luxury'
        }
      ]
    };
  }
  
  if (url.includes('/menus')) {
    return {
      menus: [
        {
          id: '1',
          name: 'Appetizers',
          package_id: '1',
          free_limit: 3,
          items: [
            { id: 'a1', name: 'Spring Rolls', price: 120 },
            { id: 'a2', name: 'Bruschetta', price: 150 },
            { id: 'a3', name: 'Chicken Satay', price: 180 },
            { id: 'a4', name: 'Stuffed Mushrooms', price: 160 },
            { id: 'a5', name: 'Cheese Platter', price: 200 },
            { id: 'a6', name: 'Hummus & Pita', price: 140 }
          ]
        },
        {
          id: '2',
          name: 'Main Course',
          package_id: '1',
          free_limit: 4,
          items: [
            { id: 'm1', name: 'Grilled Chicken', price: 250 },
            { id: 'm2', name: 'Pasta Primavera', price: 220 },
            { id: 'm3', name: 'Beef Stroganoff', price: 300 },
            { id: 'm4', name: 'Vegetable Curry', price: 200 },
            { id: 'm5', name: 'Salmon Fillet', price: 350 },
            { id: 'm6', name: 'Mushroom Risotto', price: 240 }
          ]
        },
        {
          id: '3',
          name: 'Desserts',
          package_id: '1',
          free_limit: 2,
          items: [
            { id: 'd1', name: 'Chocolate Cake', price: 150 },
            { id: 'd2', name: 'Cheesecake', price: 180 },
            { id: 'd3', name: 'Fruit Tart', price: 160 },
            { id: 'd4', name: 'Ice Cream', price: 120 },
            { id: 'd5', name: 'Tiramisu', price: 190 }
          ]
        }
      ]
    };
  }
  
  if (url.includes('/check-availability')) {
    return {
      available: true,
      message: 'Venue is available for the selected date and shift'
    };
  }
  
  if (url.includes('/calculate-fare')) {
    return {
      baseFare: 5000,
      extraCharges: 1000,
      totalFare: 6000
    };
  }
  
  return {};
};

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;