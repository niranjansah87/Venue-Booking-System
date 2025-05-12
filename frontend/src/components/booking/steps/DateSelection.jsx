import React from 'react';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateSelection = ({ date, updateBookingData }) => {
  const handleDateChange = (selectedDate) => {
    updateBookingData('date', selectedDate);
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Event Date</h2>
      <p className="text-gray-600 mb-8">Please choose the date for your event.</p>

      <div className="max-w-md mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <DatePicker
            selected={date}
            onChange={handleDateChange}
            minDate={new Date()}
            className="pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:border-primary-500 focus:ring-primary-200"
            placeholderText="Select a date"
            dateFormat="MMMM d, yyyy"
          />
        </div>
      </div>
    </div>
  );
};

export default DateSelection;