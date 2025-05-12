import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { addDays } from 'date-fns';
import { CalendarIcon, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { checkDateAvailability } from '../../../services/bookingService';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';

const DateSelection = ({ date, updateBookingData }) => {
  const [selectedDate, setSelectedDate] = useState(date || null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      checkAvailability();
    }
  }, [selectedDate]);

  const handleDateSelect = async (newDate) => {
    setSelectedDate(newDate);
    updateBookingData('date', newDate);
    setIsAvailable(false);
  };

  const checkAvailability = async () => {
    if (!selectedDate) return;
    setChecking(true);
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await checkDateAvailability(formattedDate);
      if (response.available) {
        setIsAvailable(true);
        toast.success('Date is available!');
      } else {
        setIsAvailable(false);
        toast.error('Date is not available. Please select another date.');
      }
    } catch (error) {
      setIsAvailable(false);
      toast.error(error.response?.data?.message || 'Failed to check date availability.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Event Date</h2>
      <p className="text-gray-600 mb-8">
        Choose a date for your event. We'll check availability for you.
      </p>

      <div className="flex flex-col items-center">
        <div className="mb-8 w-full max-w-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Pick a Date</h3>
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateSelect}
              minDate={addDays(new Date(), 1)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-gray-800"
              placeholderText="Select a date"
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-5 bg-primary-50 border border-primary-100 rounded-md flex items-center"
          >
            <Check className="h-8 w-8 text-primary-500 mr-4" />
            <div>
              <p className="text-primary-800 font-medium">
                Selected Date: {selectedDate.toLocaleDateString()}
              </p>
              <p className="text-primary-600 text-sm mt-1">
                {isAvailable
                  ? 'This date is available!'
                  : checking
                  ? 'Checking availability...'
                  : 'This date is not available. Please select another date.'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DateSelection;