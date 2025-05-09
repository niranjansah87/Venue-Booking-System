import React, { useState, useEffect } from 'react';
import { Check, Users, MapPin, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllVenues } from '../../../services/venueService';

const VenueSelection = ({ selectedVenue, guestCount, updateBookingData }) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVenueDetails, setSelectedVenueDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch venues from API
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const data = await getAllVenues();
        
        // For development/preview - mock data if API fails or returns empty
        if (!data.venues || data.venues.length === 0) {
          const mockVenues = [
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
            },
            {
              id: '4',
              name: 'Urban Loft',
              image: 'https://images.pexels.com/photos/260046/pexels-photo-260046.jpeg',
              capacity: 120,
              location: 'Arts District',
              rating: 4.6,
              description: 'A modern, industrial-chic space perfect for corporate events and stylish gatherings.'
            }
          ];
          setVenues(mockVenues);
        } else {
          setVenues(data.venues);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
        setError('Failed to load venues. Please try again.');
        
        // Fallback mock data for development/preview
        setVenues([
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
          },
          {
            id: '4',
            name: 'Urban Loft',
            image: 'https://images.pexels.com/photos/260046/pexels-photo-260046.jpeg',
            capacity: 120,
            location: 'Arts District',
            rating: 4.6,
            description: 'A modern, industrial-chic space perfect for corporate events and stylish gatherings.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Get suitable venues based on guest count
  const suitableVenues = venues.filter(venue => venue.capacity >= guestCount);
  
  // Get venues that are too small
  const tooSmallVenues = venues.filter(venue => venue.capacity < guestCount);

  // Handle venue selection
  const handleVenueSelect = (venueId) => {
    const venue = venues.find(v => v.id === venueId);
    
    if (venue.capacity < guestCount) {
      toast.error(`This venue can't accommodate ${guestCount} guests. Please select a larger venue or reduce your guest count.`);
      return;
    }
    
    updateBookingData('venueId', venueId);
    setSelectedVenueDetails(venue);
  };

  // Handle view details
  const handleViewDetails = (venue) => {
    setSelectedVenueDetails(venue);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-error-500 mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select a Venue</h2>
      <p className="text-gray-600 mb-4">
        Choose from our selection of premium venues that can accommodate your {guestCount} guests.
      </p>
      
      {suitableVenues.length === 0 && (
        <div className="mb-8 p-4 bg-warning-50 border border-warning-200 rounded-lg">
          <p className="text-warning-700">
            None of our venues can accommodate {guestCount} guests. Please reduce your guest count or contact us for custom arrangements.
          </p>
        </div>
      )}
      
      {/* Suitable Venues */}
      {suitableVenues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {suitableVenues.map((venue) => (
            <motion.div
              key={venue.id}
              whileHover={{ y: -5 }}
              className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                selectedVenue === venue.id
                  ? 'border-primary-500 shadow-lg'
                  : 'border-gray-200 hover:border-primary-200'
              }`}
            >
              {selectedVenue === venue.id && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-primary-500 text-white rounded-full p-1">
                    <Check className="h-5 w-5" />
                  </div>
                </div>
              )}
              
              <div className="aspect-w-16 aspect-h-9 relative">
                <img 
                  src={venue.image} 
                  alt={venue.name} 
                  className="object-cover w-full h-48"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-xl font-semibold">{venue.name}</h3>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{venue.location || 'City Center'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary-500 mr-1" />
                    <span className="text-sm text-gray-600">Capacity: {venue.capacity}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-600">{venue.rating || '4.7'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={() => handleViewDetails(venue)}
                    className="px-4 py-2 text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors text-sm font-medium flex-1"
                  >
                    View Details
                  </button>
                  
                  <button
                    onClick={() => handleVenueSelect(venue.id)}
                    className={`px-4 py-2 rounded-md transition-colors text-sm font-medium flex-1 ${
                      selectedVenue === venue.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    {selectedVenue === venue.id ? 'Selected' : 'Select Venue'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Too Small Venues */}
      {tooSmallVenues.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Other Venues (Too Small for Your Event)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tooSmallVenues.map((venue) => (
              <div
                key={venue.id}
                className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-16 h-16 object-cover rounded-md mr-4" 
                />
                <div>
                  <h4 className="font-medium text-gray-800">{venue.name}</h4>
                  <p className="text-sm text-error-600">
                    Capacity: {venue.capacity} (needs {guestCount - venue.capacity} more seats)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Venue Details Modal */}
      <AnimatePresence>
        {showDetails && selectedVenueDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img 
                  src={selectedVenueDetails.image} 
                  alt={selectedVenueDetails.name}
                  className="w-full h-64 object-cover" 
                />
                <button 
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  onClick={() => setShowDetails(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-heading font-semibold text-gray-800">{selectedVenueDetails.name}</h2>
                  <div className="flex items-center bg-primary-50 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{selectedVenueDetails.rating || '4.7'}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary-500 mr-2" />
                    <span className="text-gray-700">{selectedVenueDetails.location || 'City Center'}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary-500 mr-2" />
                    <span className="text-gray-700">Capacity: {selectedVenueDetails.capacity}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600">
                    {selectedVenueDetails.description ||
                      'A premium venue offering exceptional ambiance and top-notch facilities for your special event. Features include state-of-the-art sound systems, adjustable lighting, and a dedicated staff to ensure your event runs smoothly.'}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-success-500 mr-2" />
                      <span className="text-sm text-gray-600">WiFi</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-success-500 mr-2" />
                      <span className="text-sm text-gray-600">Parking</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-success-500 mr-2" />
                      <span className="text-sm text-gray-600">Sound System</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-success-500 mr-2" />
                      <span className="text-sm text-gray-600">Catering</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-success-500 mr-2" />
                      <span className="text-sm text-gray-600">Stage</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-success-500 mr-2" />
                      <span className="text-sm text-gray-600">Restrooms</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      handleVenueSelect(selectedVenueDetails.id);
                      setShowDetails(false);
                    }}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    disabled={selectedVenueDetails.capacity < guestCount}
                  >
                    {selectedVenueDetails.capacity < guestCount ? 'Too Small for Your Event' : 'Select This Venue'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VenueSelection;