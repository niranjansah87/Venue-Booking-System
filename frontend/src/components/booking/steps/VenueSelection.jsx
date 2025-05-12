import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';

const VenueSelection = ({ venueId, updateBookingData, checkAvailability, isAvailable, isCheckingAvailability }) => {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await api.get('/api/admin/venues');
        setVenues(response.data.venues || []);
      } catch (error) {
        console.error('Error fetching venues:', error);
        toast.error('Failed to load venues.');
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const handleVenueChange = (e) => {
    updateBookingData('venueId', parseInt(e.target.value));
  };

  const handleCheckAvailability = async () => {
    if (!user?.id) {
      toast.error('Please log in to check availability.');
      return;
    }
    await checkAvailability();
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Venue</h2>
      <p className="text-gray-600 mb-8">Choose the perfect venue for your event.</p>

      {loading ? (
        <p>Loading venues...</p>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            {venues.map((venue) => (
              <motion.label
                key={venue.id}
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="radio"
                  name="venue"
                  value={venue.id}
                  checked={venueId === venue.id}
                  onChange={handleVenueChange}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-800">{venue.name}</span>
              </motion.label>
            ))}
          </div>
          <button
            onClick={handleCheckAvailability}
            disabled={isCheckingAvailability || !venueId}
            className={`mt-6 px-6 py-3 rounded-md ${
              isCheckingAvailability || !venueId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
          </button>
          {isAvailable && (
            <p className="mt-4 text-success-600">Venue is available!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueSelection;