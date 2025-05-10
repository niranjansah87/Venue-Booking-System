import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format, isToday, addDays, isBefore } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const DateSelection = ({ date, updateBookingData, sessionId }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(date || addDays(today, 1));
  const [isValidating, setIsValidating] = useState(false);

  const handleDateChange = async (date) => {
    setIsValidating(true);
    try {
      // Validate date with backend
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await api.post('/api/admin/bookings/check-date', { event_date: formattedDate, sessionId });
      if (response.data.available) {
        setSelectedDate(date);
        updateBookingData('date', date);
        toast.success('Date is available!');
      } else {
        toast.error('Selected date is not available.');
      }
    } catch (error) {
      console.error('Error validating date:', error);
      toast.error('Failed to validate date.');
    } finally {
      setIsValidating(false);
    }
  };

  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);
  const nextWeek = addDays(today, 7);
  const nextMonth = addDays(today, 30);

  const quickDates = [
    { label: 'Tomorrow', date: tomorrow },
    { label: 'Day after tomorrow', date: dayAfterTomorrow },
    { label: 'Next week', date: nextWeek },
    { label: 'Next month', date: nextMonth },
  ];

  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Event Date</h2>
      <p className="text-gray-600 mb-6">
        Choose the date for your event. Please note that bookings must be made at least one day in advance.
      </p>

      <div className="mb-8">
        <h3 className="text-md font-medium text-gray-700 mb-3">Quick Select</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickDates.map((item, index) => (
            <button
              key={index}
              className={`py-3 px-4 rounded-lg border text-sm transition-colors ${
                isDateSelected(item.date)
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50'
              } ${isValidating ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleDateChange(item.date)}
              disabled={isValidating}
            >
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-gray-500 mt-1">{format(item.date, 'MMM d, yyyy')}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-md font-medium text-gray-700 mb-3">Or select a specific date</h3>
        <div className="relative">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={addDays(new Date(), 1)}
            dateFormat="MMMM d, yyyy"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            showPopperArrow={false}
            placeholderText="Select a date"
            filterDate={(date) => !isBefore(date, tomorrow)}
            disabled={isValidating}
          />
          <CalendarIcon className="absolute right-3 top-3.5 text-gray-400 h-5 w-5" />
        </div>
      </div>

      {selectedDate && (
        <div className="mt-8 bg-primary-50 border border-primary-100 rounded-lg p-4">
          <h3 className="text-md font-medium text-primary-800 mb-2">Your Selected Date</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-primary-900">{format(selectedDate, 'MMMM d, yyyy')}</p>
              <p className="text-sm text-primary-700">{format(selectedDate, 'EEEE')}</p>
            </div>
            <button
              className="text-primary-600 hover:text-primary-800 text-sm underline"
              onClick={() => handleDateChange(null)}
              disabled={isValidating}
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateSelection;