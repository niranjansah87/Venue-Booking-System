import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllShifts } from '../../../services/shiftService';
import { toast } from 'react-toastify';

const ShiftSelection = ({ selectedShift, updateBookingData, checkAvailability, isAvailable, isCheckingAvailability, sessionId, date, venueId }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        const data = await getAllShifts(sessionId);
        setShifts(data.shifts);
      } catch (error) {
        console.error('Error fetching shifts:', error);
        setError('Failed to load shifts. Please try again.');
        toast.error('Failed to load shifts.');
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, [sessionId]);

  const handleShiftSelect = (shiftId) => {
    updateBookingData('shiftId', shiftId);
  };

  const handleCheckAvailability = async () => {
    try {
      await checkAvailability();
      toast.success('Slot is available!');
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Selected slot is not available.');
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
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select a Time Slot</h2>
      <p className="text-gray-600 mb-8">
        Choose a time slot for your event. After selecting, you'll need to check availability.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {shifts.map((shift) => (
          <motion.div
            key={shift.id}
            whileHover={{ y: -2 }}
            whileTap={{ y: 1 }}
            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
        <div className="mt-8 p-5 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Check Availability</h3>
          <p className="text-gray-600 mb-4">
            Please verify if your selected date, venue, and time slot are available before proceeding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={handleCheckAvailability}
              disabled={isCheckingAvailability || isAvailable || !date || !venueId}
              className={`px-6 py-3 rounded-md transition-colors flex items-center justify-center w-full sm:w-auto ${
                isAvailable
                  ? 'bg-success-500 text-white cursor-default'
                  : isCheckingAvailability || !date || !venueId
                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                  : 'bg-secondary-500 text-white hover:bg-secondary-600'
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
            {isAvailable && (
              <div className="flex items-center text-success-700 bg-success-50 px-4 py-2 rounded-md">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Great! This slot is available.</span>
              </div>
            )}
            {!isAvailable && !isCheckingAvailability && selectedShift && (
              <div className="text-gray-500 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-warning-500" />
                <span>Please check availability before proceeding</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftSelection;