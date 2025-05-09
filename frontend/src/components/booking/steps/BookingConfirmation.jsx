import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Users, Clock, Package, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const BookingConfirmation = ({ bookingId, bookingData, isComplete }) => {
  const {
    date,
    venueId,
    guestCount,
    packageId,
    shiftId,
    totalFare,
    name,
    phone
  } = bookingData;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (!isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-700">Processing your booking...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-100 mb-6"
        >
          <CheckCircle className="h-10 w-10 text-success-500" />
        </motion.div>
        
        <motion.h2 variants={itemVariants} className="text-3xl font-heading font-bold text-gray-800 mb-4">
          Booking Confirmed!
        </motion.h2>
        
        <motion.p variants={itemVariants} className="text-xl text-gray-600">
          Your booking has been successfully submitted and is awaiting confirmation.
        </motion.p>
        
        <motion.div variants={itemVariants} className="mt-4">
          <p className="text-lg font-medium text-primary-700">
            Booking ID: <span className="font-bold">{bookingId}</span>
          </p>
        </motion.div>
      </div>
      
      {/* Booking Details Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 mb-8"
      >
        <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
          <h3 className="text-xl font-semibold text-primary-800">Booking Details</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Event Date</p>
                  <p className="text-base font-medium text-gray-800">
                    {date ? date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-primary-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Venue</p>
                  <p className="text-base font-medium text-gray-800">
                    {venueId ? 'Selected Venue' : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Shift</p>
                  <p className="text-base font-medium text-gray-800">
                    {shiftId ? 'Selected Shift' : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Guest Count</p>
                  <p className="text-base font-medium text-gray-800">
                    {guestCount || 0} guests
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Package className="h-5 w-5 text-primary-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Package</p>
                  <p className="text-base font-medium text-gray-800">
                    {packageId ? 'Selected Package' : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex h-5 items-center mt-1">
                  <span className="text-xl font-medium text-primary-500 mr-3">₹</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-lg font-bold text-gray-800">
                    ₹{totalFare?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="text-sm text-gray-500">Contact Information</p>
                <p className="text-base font-medium text-gray-800">{name}</p>
                <p className="text-base text-gray-700">{phone}</p>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button className="flex items-center px-4 py-2 bg-secondary-50 text-secondary-700 rounded-md hover:bg-secondary-100 transition-colors">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Status and Next Steps */}
      <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">What Happens Next?</h3>
        <ol className="space-y-4">
          <li className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-3 mt-0.5">
              1
            </div>
            <p className="text-gray-700">
              Our team will review your booking details and verify availability.
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-3 mt-0.5">
              2
            </div>
            <p className="text-gray-700">
              You'll receive a confirmation call within 24 hours.
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-3 mt-0.5">
              3
            </div>
            <p className="text-gray-700">
              Once confirmed, you'll need to make a partial payment to secure your booking.
            </p>
          </li>
        </ol>
      </motion.div>
      
      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/"
          className="px-6 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-center"
        >
          Return to Home
        </Link>
        <Link 
          to="/contact"
          className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-center"
        >
          Contact Support
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default BookingConfirmation;