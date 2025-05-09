import React from 'react';
import { Plus, Minus, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const GuestCount = ({ guestCount, updateBookingData }) => {
  const handleIncrement = () => {
    updateBookingData('guestCount', Math.min(guestCount + 10, 500));
  };

  const handleDecrement = () => {
    updateBookingData('guestCount', Math.max(guestCount - 10, 10));
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 10 && value <= 500) {
      updateBookingData('guestCount', value);
    }
  };

  // Define content for different guest count ranges
  const getGuestCountDescription = (count) => {
    if (count < 50) return 'Small, intimate gathering';
    if (count < 100) return 'Medium-sized event';
    if (count < 200) return 'Large celebration';
    return 'Very large event';
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Guest Count</h2>
      <p className="text-gray-600 mb-8">
        Please indicate how many guests you expect to attend your event. This helps us suggest 
        the most appropriate venues and calculate pricing.
      </p>
      
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center mb-8 w-full max-w-md">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            disabled={guestCount <= 10}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              guestCount <= 10
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
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
                min="10"
                max="500"
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
            disabled={guestCount >= 500}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
              guestCount >= 500
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>
        
        <div className="w-full max-w-md">
          <div className="bg-gray-100 h-2 rounded-full w-full mt-4">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((guestCount / 500) * 100, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>10</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400</span>
            <span>500</span>
          </div>
        </div>
      </div>
      
      <div className="mt-12 p-5 bg-primary-50 border border-primary-100 rounded-lg flex items-center">
        <Users className="h-10 w-10 text-primary-500 mr-4" />
        <div>
          <p className="text-gray-800 font-medium">Capacity Planning</p>
          <p className="text-sm text-gray-600">
            Our venues can accommodate from 10 to 500 guests comfortably. We'll recommend 
            venues that can properly accommodate your guest count.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestCount;