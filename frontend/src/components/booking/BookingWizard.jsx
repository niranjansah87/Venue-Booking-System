import React, { useState, useEffect, useCallback } from 'react';
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
import { toast } from 'react-toastify';

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

const BookingWizard = () => {
  const navigate = useNavigate();
  const { user, sendOtp, verifyOtp, sendBookingConfirmationEmail } = useAuth();

  // Fetch user data from local storage
  const getInitialUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return {
          name: parsedUser.name || '',
          email: parsedUser.email || '',
        };
      } catch (error) {
        console.error('Error parsing user from local storage:', error);
        return { name: '', email: '' };
      }
    }
    return { name: '', email: '' };
  };

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
    name: user?.name || getInitialUserData().name,
    email: user?.email || getInitialUserData().email,
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      console.log('No user logged in, redirecting to login.');
      toast.error('Please log in to create a booking.');
      navigate('/login');
    } else {
      console.log('BookingWizard user:', user);
      console.log('BookingWizard bookingData:', bookingData);
    }
  }, [user, navigate]);

  const updateBookingData = (key, value) => {
    setBookingData((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (key === 'venueId' || key === 'shiftId') {
      setIsAvailable(false);
    }
    if (key === 'packageId' || key === 'selectedMenus' || key === 'guestCount') {
      setBookingData((prev) => ({
        ...prev,
        baseFare: 0,
        extraCharges: 0,
        totalFare: 0,
      }));
    }
  };

  const checkAvailability = async () => {
    const { date, venueId, shiftId, event_id, guestCount } = bookingData;
    if (!date || !venueId || !shiftId || !event_id || !guestCount) {
      toast.error('Please select date, event type, guest count, venue, and shift.');
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
      toast.success('Slot is available!');
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error(error.response?.data?.message || 'Selected slot is not available.');
      throw error;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const calculateFare = useCallback(async () => {
    const { packageId, selectedMenus, guestCount } = bookingData;
    if (!packageId || !guestCount) {
      toast.error('Please select a package and guest count.');
      return;
    }
    setIsCalculating(true);
    try {
      console.log('Sending calculate-fare request:', { package_id: packageId, selected_menus: selectedMenus, guest_count: guestCount });
      const response = await api.post('/api/admin/bookings/calculate-fare', {
        package_id: packageId,
        selected_menus: selectedMenus,
        guest_count: guestCount,
      });
      console.log('Calculate-fare response:', response.data);
      const { base_fare, extra_charges, total_fare } = response.data;
      setBookingData((prev) => ({
        ...prev,
        baseFare: base_fare,
        extraCharges: extra_charges,
        totalFare: total_fare,
      }));
    } catch (error) {
      console.error('Error calculating fare:', error);
      toast.error(error.response?.data?.message || 'Failed to calculate fare.');
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, [bookingData]);

  const handleVerifyOtp = async (otp) => {
    setSubmitting(true);
    try {
      await verifyOtp(otp);
      const response = await api.post('/api/admin/bookings/store', {
        ...bookingData,
        event_date: bookingData.date.toISOString().split('T')[0],
      });
      setBookingId(response.data.bookingId);
      await sendBookingConfirmationEmail(response.data.bookingId, bookingData.email);
      setIsComplete(true);
      setCurrentStep(steps.length - 1);
    } catch (error) {
      console.error('Error storing booking:', error);
      toast.error(error.response?.data?.message || 'Failed to store booking.');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length - 2 && !isComplete) {
      // OTP step requires verification
      return;
    }
    if (currentStep === steps.findIndex((s) => s.id === 'venue') && !bookingData.venueId) {
      toast.error('Please select a venue.');
      return;
    }
    if (currentStep === steps.findIndex((s) => s.id === 'shift') && !isAvailable) {
      toast.error('Please check shift availability.');
      return;
    }
    if (currentStep === steps.findIndex((s) => s.id === 'fare') && bookingData.totalFare === 0) {
      toast.error('Please calculate fare.');
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && currentStep < steps.length - 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

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
        key={currentStep}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <CurrentStepComponent
          {...bookingData}
          updateBookingData={updateBookingData}
          checkAvailability={checkAvailability}
          isAvailable={isAvailable}
          isCheckingAvailability={isCheckingAvailability}
          calculateFare={calculateFare}
          isCalculating={isCalculating}
          verifyOtp={handleVerifyOtp}
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
              (currentStep === steps.findIndex((s) => s.id === 'venue') && !bookingData.venueId) ||
              (currentStep === steps.findIndex((s) => s.id === 'shift') && !isAvailable) ||
              (currentStep === steps.findIndex((s) => s.id === 'fare') && bookingData.totalFare === 0)
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

export default BookingWizard;