import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DateSelection from './steps/DateSelection';
import EventTypeSelection from './steps/EventTypeSelection';
import GuestCount from './steps/GuestCount';
import VenueSelection from './steps/VenueSelection';
import ShiftSelection from './steps/ShiftSelection';
import PackageSelection from './steps/PackageSelection';
import MenuSelection from './steps/MenuSelection';
import FareSummary from './steps/FareSummary';
import OtpVerification from './steps/OtpVerification';
import BookingConfirmation from './steps/BookingConfirmation';
import api from '../../services/api';
import { showToast } from '../../utils/toastUtils';

const steps = [
  { id: 'date', title: 'Select Date', component: DateSelection },
  { id: 'event', title: 'Event Type', component: EventTypeSelection },
  { id: 'guests', title: 'Guest Count', component: GuestCount },
  { id: 'venue', title: 'Venue', component: VenueSelection },
  { id: 'shift', title: 'Time Slot', component: ShiftSelection },
  { id: 'package', title: 'Package', component: PackageSelection },
  { id: 'menu', title: 'Menu', component: MenuSelection },
  { id: 'fare', title: 'Fare Summary', component: FareSummary },
  { id: 'otp', title: 'Verify Email', component: OtpVerification },
  { id: 'confirmation', title: 'Confirmation', component: BookingConfirmation },
];

const OTP_STEP_ID = 'otp';

const BookingWizard = () => {
  const navigate = useNavigate();
  const { user, sendOtp, verifyOtp, sendConfirmation } = useAuth();

  // Memoize components
  const MemoizedComponents = useMemo(
    () =>
      steps.reduce((acc, step) => {
        acc[step.id] = memo(step.component);
        return acc;
      }, {}),
    []
  );

  const getInitialUserData = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.id || !parsedUser.email || !parsedUser.name) {
          throw new Error('Invalid user data in localStorage');
        }
        return {
          id: parsedUser.id || null,
          name: parsedUser.name || '',
          email: parsedUser.email || '',
        };
      } catch (error) {
        // console.error('Error parsing user from local storage:', error);
        localStorage.removeItem('user'); // Clear invalid data
        return { id: null, name: '', email: '' };
      }
    }
    return { id: null, name: '', email: '' };
  }, []);

  const initialUserData = useMemo(() => {
    const data = getInitialUserData();
    // console.log('BookingWizard: initialUserData:', data);
    return data;
  }, [getInitialUserData]);

  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: null,
    event_id: null,
    guestCount: 50,
    venueId: null,
    shiftId: null,
    packageId: null,
    selectedMenus: {},
    baseFare: 0,
    extraCharges: 0,
    totalFare: 0,
    name: user?.name || initialUserData.name,
    email: user?.email || initialUserData.email,
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Memoize bookingData to prevent prop changes
  const memoizedBookingData = useMemo(() => ({ ...bookingData }), [bookingData]);

  // Persist currentStep for OTP step
  useEffect(() => {
    const otpStepIndex = steps.findIndex((step) => step.id === OTP_STEP_ID);
    if (user && steps[currentStep].id !== OTP_STEP_ID && currentStep === steps.length - 2) {
      // console.log('BookingWizard: Setting currentStep to OTP step', otpStepIndex);
      setCurrentStep(otpStepIndex);
    }
  }, [user, currentStep]);

  // Sync bookingData with user changes and reset email when user is null
  useEffect(() => {
    if (user) {
      // console.log('BookingWizard: Syncing bookingData with user', { name: user.name, email: user.email });
      setBookingData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    } else {
      // console.log('BookingWizard: Resetting bookingData.email as user is null');
      setBookingData((prev) => ({
        ...prev,
        email: initialUserData.email, // Reset to empty string
      }));
    }
  }, [user, initialUserData.email, bookingData.name, bookingData.email]);

  // Debug state changes
  useEffect(() => {
    console.log('BookingWizard: state:', {
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      currentStep,
      stepId: steps[currentStep].id,
      bookingData: { email: bookingData.email, name: bookingData.name },
    });
  }, [user, currentStep, bookingData.email, bookingData.name]);

  const updateBookingData = useCallback((key, value) => {
    setBookingData((prev) => {
      console.log('BookingWizard: Updating bookingData', { key, value });
      const newData = { ...prev, [key]: value };
      if (key === 'venueId' || key === 'shiftId') {
        setIsAvailable(false);
      }
      if (['packageId', 'selectedMenus', 'guestCount'].includes(key)) {
        return { ...newData, baseFare: 0, extraCharges: 0, totalFare: 0 };
      }
      return newData;
    });
  }, []);

  const checkAvailability = useCallback(async () => {
    const { date, venueId, shiftId, event_id, guestCount } = bookingData;
    if (!date || !venueId || !shiftId || !event_id || !guestCount) {
      showToast('Please select all required fields.', { type: 'error' });
      return;
    }
    setIsCheckingAvailability(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      await api.post('/api/admin/bookings/check-availability', {
        event_id,
        venue_id: venueId,
        shift_id: shiftId,
        event_date: formattedDate,
        guest_count: guestCount,
      });
      setIsAvailable(true);
      showToast('Slot is available!', { type: 'success' });
    } catch (error) {
      showToast(error.response?.data?.message || 'Selected slot is not available.', {
        type: 'error',
      });
      throw error;
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [bookingData]);

  const calculateFare = useCallback(async () => {
    const { packageId, selectedMenus, guestCount } = bookingData;
    if (!packageId || !guestCount) {
      showToast('Please select a package and guest count.', { type: 'error' });
      return;
    }
    setIsCalculating(true);
    try {
      const response = await api.post('/api/admin/bookings/calculate-fare', {
        package_id: packageId,
        selected_menus: selectedMenus,
        guest_count: guestCount,
      });
      const { base_fare, extra_charges, total_fare } = response.data;
      setBookingData((prev) => ({
        ...prev,
        baseFare: base_fare,
        extraCharges: extra_charges,
        totalFare: total_fare,
      }));
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to calculate fare.', { type: 'error' });
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, [bookingData]);

  const handleVerifyOtp = useCallback(
    async (otp) => {
      setSubmitting(true);
      try {
        await verifyOtp(otp);
        const requiredFields = [
          'date',
          'event_id',
          'venueId',
          'shiftId',
          'packageId',
          'guestCount',
          'name',
          'email',
        ];
        const missingFields = requiredFields.filter(
          (field) => !bookingData[field] || bookingData[field] === null
        );
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        if (!user?.id) {
          throw new Error('User ID not found. Please log in again.');
        }
        const payload = {
          user_id: user.id,
          event_id: bookingData.event_id,
          venue_id: bookingData.venueId,
          shift_id: bookingData.shiftId,
          package_id: bookingData.packageId,
          guest_count: bookingData.guestCount,
          event_date: bookingData.date.toISOString().split('T')[0],
          selected_menus: bookingData.selectedMenus,
          customer_name: bookingData.name,
          customer_email: bookingData.email,
          base_fare: bookingData.baseFare,
          extra_charges: bookingData.extraCharges,
          total_fare: bookingData.totalFare,
        };
        const response = await api.post('/api/admin/bookings/store', payload);
        setBookingId(response.data.bookingId);
        await sendConfirmation(response.data.bookingId, bookingData.email);
        setIsComplete(true);
        setCurrentStep(steps.length - 1);
      } catch (error) {
        const errorMessage =
          error.response?.data?.errors?.map((err) => err.msg).join(', ') ||
          error.response?.data?.message ||
          error.message ||
          'Failed to store booking.';
        showToast(errorMessage, { type: 'error' });
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [verifyOtp, user, bookingData, sendConfirmation]
  );

  const sendOtpCallback = useCallback(
    async (email) => {
      // console.log('BookingWizard: Sending OTP for email:', email);
      return await sendOtp(email);
    },
    [sendOtp]
  );

  const handleNext = useCallback(() => {
    if (currentStep === steps.length - 2 && !isComplete) {
      // console.log('BookingWizard: Cannot proceed from OTP step until complete');
      return;
    }
    if (steps[currentStep].id === 'venue' && !bookingData.venueId) {
      showToast('Please select a venue.', { type: 'error' });
      return;
    }
    if (steps[currentStep].id === 'shift' && !isAvailable) {
      showToast('Please check shift availability.', { type: 'error' });
      return;
    }
    if (steps[currentStep].id === 'fare' && bookingData.totalFare === 0) {
      showToast('Please calculate fare.', { type: 'error' });
      return;
    }
    if (currentStep < steps.length - 1) {
      // console.log('BookingWizard: Moving to next step', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, isComplete, bookingData, isAvailable]);

  const handleBack = useCallback(() => {
    if (currentStep > 0 && currentStep < steps.length - 1) {
      // console.log('BookingWizard: Moving to previous step', currentStep - 1);
      setCurrentStep(currentStep - 1);
    } else {
      // console.log('BookingWizard: Navigating to home');
      navigate('/');
    }
  }, [currentStep, navigate]);

  const CurrentStepComponent = MemoizedComponents[steps[currentStep].id];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-heading font-bold text-gray-800 mb-8">Book Your Event</h1>

      <div className="mb-12">
        <div className="flex justify-between items-center">
          {steps.slice(0, -1).map((step, index) => (
            <div key={step.id} className="flex-1 text-center">
              <div
                className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <p
                className={`mt-2 text-sm font-medium ${
                  index <= currentStep ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-2 relative">
          <div className="absolute top-4 w-full h-1 bg-gray-200"></div>
          <div
            className="absolute top-4 h-1 bg-primary-600 transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 2)) * 100}%` }}
          ></div>
        </div>
      </div>

      <motion.div
        key="booking-wizard-content"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <CurrentStepComponent
          email={memoizedBookingData.email}
          name={memoizedBookingData.name}
          date={memoizedBookingData.date}
          event_id={memoizedBookingData.event_id}
          guestCount={memoizedBookingData.guestCount}
          venueId={memoizedBookingData.venueId}
          shiftId={memoizedBookingData.shiftId}
          packageId={memoizedBookingData.packageId}
          selectedMenus={memoizedBookingData.selectedMenus}
          baseFare={memoizedBookingData.baseFare}
          extraCharges={memoizedBookingData.extraCharges}
          totalFare={memoizedBookingData.totalFare}
          updateBookingData={updateBookingData}
          checkAvailability={checkAvailability}
          isAvailable={isAvailable}
          isCheckingAvailability={isCheckingAvailability}
          calculateFare={calculateFare}
          isCalculating={isCalculating}
          verifyOtp={handleVerifyOtp}
          sendOtp={sendOtpCallback}
          submitting={submitting}
          bookingId={bookingId}
          isComplete={isComplete}
        />
      </motion.div>

      {currentStep < steps.length - 1 && (
        <div className="mt-8 flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={
              (steps[currentStep].id === 'venue' && !bookingData.venueId) ||
              (steps[currentStep].id === 'shift' && !isAvailable) ||
              (steps[currentStep].id === 'fare' && bookingData.totalFare === 0)
            }
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(BookingWizard);