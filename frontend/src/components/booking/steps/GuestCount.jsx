import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

const GuestCount = ({ guestCount, updateBookingData }) => {
  const handleGuestChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 10) {
      updateBookingData('guestCount', value);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Guest Count</h2>
      <p className="text-gray-600 mb-8">How many guests are you expecting?</p>

      <div className="max-w-md mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            value={guestCount}
            onChange={handleGuestChange}
            min="10"
            className="pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:border-primary-500 focus:ring-primary-200"
            placeholder="Enter number of guests"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">Minimum 10 guests required.</p>
      </div>
    </div>
  );
};

export default GuestCount;