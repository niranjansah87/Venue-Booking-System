import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { sendOTP } from '../../../services/bookingService';
import { toast } from 'react-toastify';

const OtpVerification = ({ email, name, verifyOtp, submitting }) => {
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sendOtpToEmail = async () => {
      try {
        setSendingOtp(true);
        await sendOTP(email);
        setIsOtpSent(true);
        toast.success('OTP sent to your email.');
      } catch (error) {
        setError('Failed to send OTP.');
        toast.error('Failed to send OTP.');
      } finally {
        setSendingOtp(false);
      }
    };
    if (email && !isOtpSent) {
      sendOtpToEmail();
    }
  }, [email, isOtpSent]);

  const handleOtpSubmit = async () => {
    try {
      await verifyOtp(otp);
      toast.success('OTP verified successfully.');
    } catch (error) {
      setError('Invalid OTP.');
      toast.error('Invalid OTP.');
    }
  };

  if (sendingOtp) {
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
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Verify Your Email</h2>
      <p className="text-gray-600 mb-8">
        We've sent an OTP to {email}. Please enter it below to confirm your booking.
      </p>

      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
            placeholder="Enter OTP"
          />
        </div>
        <button
          onClick={handleOtpSubmit}
          disabled={submitting || !otp}
          className={`w-full py-3 rounded-md transition-colors flex items-center justify-center ${
            submitting || !otp
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {submitting ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>
      </div>

      {isOtpSent && (
        <div className="mt-8 p-5 bg-primary-50 border border-primary-100 rounded-md flex items-start">
          <Mail className="h-8 w-8 text-primary-500 mr-4 flex-shrink-0 mt-1" />
          <div>
            <p className="text-lg font-medium text-primary-800">OTP Sent</p>
            <p className="text-primary-600 mt-1">
              Check your email ({email}) for the OTP.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtpVerification;