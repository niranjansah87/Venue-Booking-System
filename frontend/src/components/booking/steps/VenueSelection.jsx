import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllVenues, checkAvailability } from '../../../services/venueService';
import { toast } from 'react-toastify';

const VenueSelection = ({ selectedVenue, updateBookingData, isAvailable, isCheckingAvailability, sessionId, guestCount, date }) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const data = await getAllVenues(guestCount, sessionId, 1, 10);
        setVenues(Array.isArray(data.venues) ? data.venues : []);
      } catch (error) {
        console.error('Error fetching venues:', error);
        setError('Failed to load venues. Please try again.');
        toast.error('Failed to load venues.');
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, [guestCount, sessionId]);

  const handleVenueSelect = (venueId) => {
    updateBookingData('venueId', venueId);
  };

  const handleCheckAvailability = async (shiftId) => {
    try {
      updateBookingData('shiftId', shiftId);
      await checkAvailability(selectedVenue, date, shiftId, sessionId);
      toast.success('Venue is available!');
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Selected venue is not available.');
    }
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
      <p className="text-gray-600 mb-8">
        Choose a venue that suits your event. Ensure the venue can accommodate your guest count.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {venues.map((venue) => (
          <motion.div
            key={venue.id}
            whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className={`relative rounded-lg border-2 overflow-hidden transition-all ${
              selectedVenue === venue.id ? 'border-primary-500' : 'border-gray-200 hover:border-primary-200'
            }`}
            onClick={() => handleVenueSelect(venue.id)}
          >
            <div className="h-48 overflow-hidden">
              <img
                src={venue.image ? `${BACKEND_URL}/${venue.image}` : 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg'}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{venue.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{venue.description}</p>
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                Capacity: {venue.capacity} guests
              </div>
              <button
                className={`w-full py-2 rounded-md font-medium transition-colors ${
                  selectedVenue === venue.id ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {selectedVenue === venue.id ? 'Selected' : 'Select Venue'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedVenue && (
        <div className="mt-8 p-5 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Check Availability</h3>
          <p className="text-gray-600 mb-4">
            Verify if your selected venue is available for the chosen date and shift.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              {['Morning', 'Afternoon', 'Evening'].map((shift, index) => (
                <button
                  key={index}
                  onClick={() => handleCheckAvailability(index + 1)}
                  disabled={isCheckingAvailability || isAvailable || !date}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isAvailable
                      ? 'bg-success-500 text-white cursor-default'
                      : isCheckingAvailability || !date
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-secondary-500 text-white hover:bg-secondary-600'
                  }`}
                >
                  {shift}
                </button>
              ))}
            </div>
            <div className="flex items-center">
              {isCheckingAvailability ? (
                <div className="flex items-center text-gray-500">
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Checking...
                </div>
              ) : isAvailable ? (
                <div className="flex items-center text-success-700 bg-success-50 px-4 py-2 rounded-md">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Great! This venue is available.</span>
                </div>
              ) : (
                selectedVenue && (
                  <div className="text-gray-500 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-warning-500" />
                    <span>Please select a shift and check availability</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueSelection;