import React, { useState, useEffect } from 'react';
import { Check, Calendar } from 'lucide-react';
import { getAllEvents } from '../../../services/eventService';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const EventTypeSelection = ({ selectedEventType, updateBookingData }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getAllEvents();
        // console.log('Fetched events:', data);
        if (data?.events?.length) {
          setEvents(data.events);
        } else if (Array.isArray(data) && data.length) {
          // If API returns an array directly
          setEvents(data);
        } else {
          setError('No events found.');
          toast.error('No events found.');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load event types. Please try again.');
        toast.error('Failed to load event types.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventTypeSelect = (eventId) => {
    updateBookingData('event_id', eventId);
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
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Event Type</h2>
      <p className="text-gray-600 mb-8">
        Choose the type of event you're planning to host at our venue.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const isSelected = Number(selectedEventType) === Number(event.id);
          return (
            <motion.div
              key={event.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
              }`}
              onClick={() => handleEventTypeSelect(event.id)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="bg-primary-500 text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center text-center">
                <Calendar className="h-10 w-10 text-primary-500" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">{event.name || 'Unnamed Event'}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Perfect for {(event.name || 'your').toLowerCase()} celebrations and gatherings.
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedEventType && (
        <div className="mt-8 p-4 bg-primary-50 border border-primary-100 rounded-lg">
          <p className="text-primary-800 font-medium">
            You've selected:{' '}
            {events.find((e) => Number(e.id) === Number(selectedEventType))?.name || 'Unknown'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventTypeSelection;
