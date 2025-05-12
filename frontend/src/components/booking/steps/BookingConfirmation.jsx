import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';

const BookingConfirmation = ({ bookingId, email }) => {
  const { user } = useAuth();

  return (
    <div className="text-center">
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Booking Confirmed!</h2>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-success-500" />
        </div>
        <p className="text-gray-600 max-w-md">
          Thank you, {user?.name}! Your booking (ID: {bookingId}) has been confirmed. A confirmation email has been sent to {email}.
        </p>
      </motion.div>

      <a
        href="/"
        className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Return to Home
      </a>
    </div>
  );
};

export default BookingConfirmation;