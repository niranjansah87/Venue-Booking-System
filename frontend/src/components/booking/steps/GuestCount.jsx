import React, { useState, useEffect } from 'react';
import { Plus, Minus, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllVenues } from '../../../services/venueService';
import { toast } from 'react-toastify';

const GuestCount = ({ guestCount, updateBookingData, sessionId }) => {
  const [minGuests, setMinGuests] = useState(10);
  const [maxGuests, setMaxGuests] = useState(500);

  useEffect(() => {
    const fetchVenueCapacities = async () => {
      try {
        const response = await getAllVenues(null, sessionId, 1, 100);
        const venues = Array.isArray(response.venues) ? response.venues : [];
        if (venues.length > 0) {
          const capacities = venues.map((venue) => venue.capacity);
          setMinGuests(Math.min(...capacities, 10));
          setMaxGuests(Math.max(...capacities, 500));
        } else {
          toast.warn('No venues available.');
        }
      } catch (error) {
        console.error('Error fetching venue capacities:', error);
        toast.error('Failed to load venue capacities.');
      }
    };
    fetchVenueCapacities();
  }, [sessionId]);

  const handleIncrement = () => {
    updateBookingData('guestCount', Math.min(guestCount + 10, maxGuests));
  };

  const handleDecrement = () => {
    updateBookingData('guestCount', Math.max(guestCount - 10, minGuests));
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minGuests && value <= maxGuests) {
      updateBookingData('guestCount', value);
    }
  };

  const getGuestCountDescription = (count) => {
    if (count < 50) return 'Small, intimate gathering';
    if (count < 100) return 'Medium-sized event';
    if (count < 200) return 'Large celebration';
    return 'Grand event';
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Guest Count</h2>
      <p className="text-gray-600 mb-8">
        Please indicate how many guests you expect for your event with Surbhi Venues. This helps us recommend the perfect venue.
      </p>

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center mb-8 w-full max-w-md">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            disabled={guestCount <= minGuests}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              guestCount <= minGuests ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
          >
            <Minus className="h-5 w-5" />
          </motion.button>

          <div className="flex flex-col items-center mx-6 sm:mx-10">
            <div className="relative">
              <input
                type="number"
                value={guestCount}
                onChange={handleInputChange}
                min={minGuests}
                max={maxGuests}
                className="w-24 h-16 text-center text-4xl font-semibold text-gray-800 border-b-2 border-primary-300 focus:border-primary-500 focus:outline-none"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <motion.div
                  key={guestCount}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-3 left-full ml-2 bg-primary-500 text-white text-xs px-2 py-1 rounded"
                >
                  guests
                </motion.div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{getGuestCountDescription(guestCount)}</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrement}
            disabled={guestCount >= maxGuests}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              guestCount >= maxGuests ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-gray-100 h-2 rounded-full w-full mt-4">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(((guestCount - minGuests) / (maxGuests - minGuests)) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{minGuests}</span>
            <span>{Math.round(maxGuests / 5)}</span>
            <span>{Math.round(maxGuests / 2)}</span>
            <span>{Math.round((maxGuests * 3) / 4)}</span>
            <span>{maxGuests}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 p-5 bg-primary-50 border border-primary-100 rounded-lg flex items-center">
        <Users className="h-10 w-10 text-primary-500 mr-4" />
        <div>
          <p className="text-gray-800 font-medium">Capacity Planning with Surbhi Venues</p>
          <p className="text-sm text-gray-600">
            Our venues can accommodate from {minGuests} to {maxGuests} guests comfortably, perfect for any event, from intimate gatherings to grand Indian celebrations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestCount;