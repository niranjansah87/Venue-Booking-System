import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllShifts } from '../../../services/shiftService';
import { toast } from 'react-toastify';

const ShiftSelection = ({ shiftId, updateBookingData, isAvailable, isCheckingAvailability, checkAvailability }) => {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(shiftId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        const data = await getAllShifts();
        setShifts(data);
      } catch (error) {
        setError('Failed to load shifts.');
        toast.error('Failed to load shifts.');
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, []);

  const handleShiftSelect = (shiftId) => {
    setSelectedShift(shiftId);
    updateBookingData('shiftId', shiftId);
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
        <p className="text-red-500 mb-4">{error}</p>
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
    <div className="p-6">
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select a Time Slot</h2>
      <p className="text-gray-600 mb-8">
        Choose a time slot for your event and check availability.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {shifts.map((shift) => (
          <motion.div
            key={shift.id}
            whileHover={{ y: -2 }}
            whileTap={{ y: 1 }}
            className={`p-4 border-2 rounded-md cursor-pointer transition-all ${
              selectedShift === shift.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
            }`}
            onClick={() => handleShiftSelect(shift.id)}
          >
            <div className="flex items-start">
              <Clock className={`h-5 w-5 mt-0.5 mr-3 ${selectedShift === shift.id ? 'text-primary-600' : 'text-gray-400'}`} />
              <div>
                <h3 className="text-lg font-medium text-gray-800">{shift.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Duration: 4 hours</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedShift && (
        <div className="mt-8 p-5 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Check Availability</h3>
          <p className="text-gray-600 mb-4">
            Verify if your selected date, venue, and time slot are available.
          </p>
          <button
            onClick={checkAvailability}
            disabled={isCheckingAvailability || isAvailable}
            className={`px-6 py-3 rounded-md transition-colors flex items-center justify-center w-full sm:w-auto ${
              isAvailable
                ? 'bg-green-500 text-white cursor-default'
                : isCheckingAvailability
                ? 'bg-gray-300 text-gray-500 cursor-wait'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isCheckingAvailability ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Checking...
              </>
            ) : isAvailable ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Available!
              </>
            ) : (
              'Check Availability'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShiftSelection;