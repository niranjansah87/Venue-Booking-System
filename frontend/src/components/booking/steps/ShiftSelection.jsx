import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';

const ShiftSelection = ({ shiftId, updateBookingData, checkAvailability, isAvailable, isCheckingAvailability }) => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await api.get('/api/admin/shifts');
        setShifts(response.data.shifts || []);
      } catch (error) {
        console.error('Error fetching shifts:', error);
        toast.error('Failed to load shifts.');
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, []);

  const handleShiftChange = (e) => {
    updateBookingData('shiftId', parseInt(e.target.value));
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
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Time Slot</h2>
      <p className="text-gray-600 mb-8">Choose a time slot for your event.</p>

      {loading ? (
        <p>Loading shifts...</p>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            {shifts.map((shift) => (
              <motion.label
                key={shift.id}
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="radio"
                  name="shift"
                  value={shift.id}
                  checked={shiftId === shift.id}
                  onChange={handleShiftChange}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-800">{shift.name} ({shift.time})</span>
              </motion.label>
            ))}
          </div>
          <button
            onClick={handleCheckAvailability}
            disabled={isCheckingAvailability || !shiftId}
            className={`mt-6 px-6 py-3 rounded-md ${
              isCheckingAvailability || !shiftId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
          </button>
          {isAvailable && (
            <p className="mt-4 text-success-600">Time slot is available!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ShiftSelection;