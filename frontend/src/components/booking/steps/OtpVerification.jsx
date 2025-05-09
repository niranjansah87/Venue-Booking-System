import React, { useState, useRef, useEffect } from 'react';
import { Lock, RefreshCw, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const OtpVerification = ({ phone, verifyOtp, submitting }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0 && resendDisabled) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  // Set focus on first input on component mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear verification error when typing
    if (verificationError) {
      setVerificationError('');
    }
    
    // Move to next input if current input is filled
    if (value !== '' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
    
    // Submit OTP if all fields are filled
    if (index === 3 && value !== '' && newOtp.every(digit => digit !== '')) {
      handleSubmit(newOtp.join(''));
    }
  };

  // Handle key down events for OTP inputs
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Handle OTP resend
  const handleResendOtp = () => {
    // Here you would call your resend OTP function
    setResendDisabled(true);
    setCountdown(30);
    
    // Clear existing OTP and set focus on first input
    setOtp(['', '', '', '']);
    inputRefs[0].current?.focus();
    
    // Clear any verification errors
    setVerificationError('');
  };

  // Handle OTP submission
  const handleSubmit = async (otpValue) => {
    try {
      setIsVerifying(true);
      setVerificationError('');
      
      // Call the verify OTP function
      await verifyOtp(otpValue);
      
      // Set success animation
      setSuccess(true);
    } catch (error) {
      setVerificationError('Invalid OTP. Please check and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Verify Your Phone</h2>
      
      <div className="max-w-md mx-auto">
        <div className="bg-primary-50 rounded-lg p-6 mb-8 flex items-center">
          <Lock className="h-8 w-8 text-primary-500 mr-4" />
          <div>
            <p className="text-primary-800 font-medium">
              We've sent a verification code to:
            </p>
            <p className="text-primary-900 font-semibold mt-1">
              {phone.replace(/(\d{3})(\d{3})(\d{4})/, '+91 $1 $2 $3')}
            </p>
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter the 4-digit verification code
        </label>
        
        {/* OTP Input Fields */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 ${
                verificationError 
                  ? 'border-error-300 focus:border-error-500 focus:ring-error-200' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
              }`}
            />
          ))}
        </div>
        
        {/* Error Message */}
        {verificationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-error-600 mb-4"
          >
            {verificationError}
          </motion.div>
        )}
        
        {/* Resend OTP Timer */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">
            Didn't receive a code?
          </p>
          <button 
            onClick={handleResendOtp}
            disabled={resendDisabled}
            className={`flex items-center justify-center mx-auto ${
              resendDisabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-primary-600 hover:text-primary-800'
            }`}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>
        
        {/* Submit Button */}
        <button
          onClick={() => handleSubmit(otp.join(''))}
          disabled={otp.some(digit => digit === '') || isVerifying || submitting || success}
          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition-colors ${
            otp.some(digit => digit === '') || isVerifying || submitting || success
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isVerifying || submitting ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              {isVerifying ? 'Verifying...' : 'Processing...'}
            </>
          ) : success ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Verified Successfully
            </>
          ) : (
            'Verify & Continue'
          )}
        </button>
      </div>
      
      {/* Success Animation */}
      {success && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center mt-8"
        >
          <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-success-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Phone Verified!</h3>
          <p className="text-gray-600 text-center">
            Your phone number has been successfully verified. Please wait while we process your booking...
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default OtpVerification;