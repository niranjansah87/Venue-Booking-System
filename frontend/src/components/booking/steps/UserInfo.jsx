import React, { useState } from 'react';
import { User, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';

const UserInfo = ({ name, email, updateBookingData }) => {
  const { sendOtp } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: name || '',
      email: email || '',
    },
  });

  const [otpSent, setOtpSent] = useState(false);

  const watchedValues = watch();

  React.useEffect(() => {
    if (watchedValues.name) {
      updateBookingData('name', watchedValues.name);
    }
  }, [watchedValues.name, updateBookingData]);

  const onSendOtp = async () => {
    try {
      await sendOtp();
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP.');
    }
  };

  const onSubmit = (data) => {
    updateBookingData('name', data.name);
    updateBookingData('email', data.email);
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Your Information</h2>
      <p className="text-gray-600 mb-8">
        Please verify your details. We'll send a verification code to your email.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
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
                    message: 'Name should be at least 2 characters',
                  },
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

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="pl-10 w-full p-3 border rounded-lg bg-gray-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              We'll send a verification code to this email
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={onSendOtp}
              disabled={otpSent}
              className={`px-6 py-3 rounded-md ${
                otpSent
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {otpSent ? 'OTP Sent' : 'Send OTP'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserInfo;