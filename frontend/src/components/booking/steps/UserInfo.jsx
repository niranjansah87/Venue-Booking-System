import React from 'react';
import { User, Phone, Mail, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

const UserInfo = ({ name, phone, updateBookingData, sendOtp }) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: name || '',
      phone: phone || '',
      email: '',
      agreeToTerms: false
    }
  });

  // Watch form values for real-time updates
  const watchedValues = watch();

  // Update booking data when form values change
  React.useEffect(() => {
    if (watchedValues.name) {
      updateBookingData('name', watchedValues.name);
    }
    if (watchedValues.phone) {
      updateBookingData('phone', watchedValues.phone);
    }
  }, [watchedValues.name, watchedValues.phone, updateBookingData]);

  const onSubmit = (data) => {
    updateBookingData('name', data.name);
    updateBookingData('phone', data.phone);
    updateBookingData('email', data.email);
    
    sendOtp();
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Your Information</h2>
      <p className="text-gray-600 mb-8">
        Please provide your contact details. We'll send a verification code to your phone.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name should be at least 2 characters'
                  }
                })}
                className={`pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name 
                    ? 'border-error-300 focus:border-error-500 focus:ring-error-200' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-error-600"
              >
                {errors.name.message}
              </motion.p>
            )}
          </div>
          
          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                className={`pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.phone 
                    ? 'border-error-300 focus:border-error-500 focus:ring-error-200' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                }`}
                placeholder="Enter your 10-digit phone number"
              />
            </div>
            {errors.phone && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-error-600"
              >
                {errors.phone.message}
              </motion.p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              We'll send a verification code to this number
            </p>
          </div>
          
          {/* Email Field (Optional) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                className={`pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email 
                    ? 'border-error-300 focus:border-error-500 focus:ring-error-200' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
                }`}
                placeholder="Enter your email address (optional)"
              />
            </div>
            {errors.email && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-error-600"
              >
                {errors.email.message}
              </motion.p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              For booking confirmation and updates
            </p>
          </div>
          
          {/* Terms and Conditions */}
          <div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  {...register('agreeToTerms', { 
                    required: 'You must agree to the terms and conditions'
                  })}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-700">
                  I agree to the <a href="#" className="text-primary-600 hover:text-primary-800">Terms and Conditions</a> and <a href="#" className="text-primary-600 hover:text-primary-800">Privacy Policy</a>
                </label>
                {errors.agreeToTerms && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-error-600"
                  >
                    {errors.agreeToTerms.message}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-warning-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-1">Important Information</p>
                <p>By proceeding, you'll receive an OTP on your phone for verification. Your booking is not confirmed until verification is complete and approved by our team.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              Proceed to Verification
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserInfo;