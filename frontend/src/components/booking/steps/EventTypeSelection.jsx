import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const EventTypeSelection = ({ event_id, updateBookingData }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/api/admin/events');
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load event types.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEventChange = (e) => {
    updateBookingData('event_id', parseInt(e.target.value));
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Event Type</h2>
      <p className="text-gray-600 mb-8">Choose the type of event you are planning.</p>

      {loading ? (
        <p>Loading events...</p>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            {events.map((event) => (
              <motion.label
                key={event.id}
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="radio"
                  name="event"
                  value={event.id}
                  checked={event_id === event.id}
                  onChange={handleEventChange}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-800">{event.name}</span>
              </motion.label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTypeSelection;