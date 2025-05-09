import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { createBooking, checkAvailability, calculateFare } from '../../services/bookingService';
import DateSelection from './steps/DateSelection';
import EventTypeSelection from './steps/EventTypeSelection';
import GuestCount from './steps/GuestCount';
import VenueSelection from './steps/VenueSelection';
import ShiftSelection from './steps/ShiftSelection';
import PackageSelection from './steps/PackageSelection';
import MenuSelection from './steps/MenuSelection';
import FareSummary from './steps/FareSummary';
import UserInfo from './steps/UserInfo';
import OtpVerification from './steps/OtpVerification';
import BookingConfirmation from './steps/BookingConfirmation';

const steps = [
  'Date Selection',
  'Event Type',
  'Guest Count',
  'Venue Selection',
  'Shift Selection',
  'Package Selection',
  'Menu Selection',
  'Fare Calculation',
  'User Information',
  'OTP Verification',
  'Confirmation'
];

const BookingWizard = () => {
  const { user, sendOtp, verifyOtp } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: null,
    eventTypeId: '',
    guestCount: 50,
    venueId: '',
    shiftId: '',
    packageId: '',
    selectedMenus: {},
    totalFare: 0,
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  
  // Update form with user data if logged in
  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email
      }));
    }
  }, [user]);
  
  const updateBookingData = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset availability check when changing date, venue, or shift
    if (['date', 'venueId', 'shiftId'].includes(field)) {
      setIsAvailable(false);
    }
    
    // Reset menu selections when changing package
    if (field === 'packageId') {
      setBookingData(prev => ({
        ...prev,
        selectedMenus: {},
        [field]: value
      }));
    }
  };
  
  const checkVenueAvailability = async () => {
    const { date, venueId, shiftId } = bookingData;
    
    if (!date || !venueId || !shiftId) {
      toast.error('Please select date, venue, and shift to check availability');
      return;
    }
    
    try {
      setIsCheckingAvailability(true);
      
      const formattedDate = date.toISOString().split('T')[0];
      const result = await checkAvailability(formattedDate, venueId, shiftId);
      
      setIsAvailable(result.available);
      
      if (result.available) {
        toast.success('Venue is available for the selected date and shift!');
      } else {
        toast.error('Venue is not available for the selected date and shift. Please try another combination.');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability. Please try again.');
      setIsAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };
  
  const calculateBookingFare = async () => {
    try {
      setIsCalculatingFare(true);
      
      const { packageId, selectedMenus, guestCount } = bookingData;
      
      if (!packageId) {
        toast.error('Please select a package to calculate fare');
        return;
      }
      
      const fareData = {
        packageId,
        selectedMenus,
        guestCount
      };
      
      const result = await calculateFare(fareData);
      
      setBookingData(prev => ({
        ...prev,
        totalFare: result.totalFare,
        baseFare: result.baseFare,
        extraCharges: result.extraCharges
      }));
      
      toast.success('Fare calculated successfully!');
      nextStep();
    } catch (error) {
      console.error('Error calculating fare:', error);
      toast.error('Failed to calculate fare. Please try again.');
    } finally {
      setIsCalculatingFare(false);
    }
  };
  
  const sendOtpToPhone = async () => {
    const { phone } = bookingData;
    
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    
    try {
      await sendOtp(phone);
      setOtpSent(true);
      toast.success('OTP sent successfully!');
      nextStep();
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    }
  };
  
  const verifyOtpCode = async (otp) => {
    try {
      const { phone } = bookingData;
      const result = await verifyOtp(phone, otp);
      
      if (result.verified) {
        setOtpVerified(true);
        submitBooking();
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
    }
  };
  
  const submitBooking = async () => {
    try {
      setSubmitting(true);
      
      const { 
        date, eventTypeId, guestCount, venueId, shiftId, 
        packageId, selectedMenus, totalFare, name, phone, email 
      } = bookingData;
      
      if (!date || !eventTypeId || !guestCount || !venueId || !shiftId || !packageId || !name || !phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const bookingPayload = {
        date: date.toISOString().split('T')[0],
        eventTypeId,
        guestCount,
        venueId,
        shiftId,
        packageId,
        selectedMenus,
        totalFare,
        name,
        phone,
        email,
        status: 'pending'
      };
      
      const result = await createBooking(bookingPayload);
      
      if (result.booking) {
        setBookingId(result.booking.id);
        setBookingComplete(true);
        toast.success('Booking submitted successfully!');
        nextStep();
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        if (!bookingData.date) {
          toast.error('Please select a date');
          return false;
        }
        break;
      case 1:
        if (!bookingData.eventTypeId) {
          toast.error('Please select an event type');
          return false;
        }
        break;
      case 2:
        if (!bookingData.guestCount || bookingData.guestCount < 10) {
          toast.error('Please enter a valid number of guests (minimum 10)');
          return false;
        }
        break;
      case 3:
        if (!bookingData.venueId) {
          toast.error('Please select a venue');
          return false;
        }
        break;
      case 4:
        if (!bookingData.shiftId) {
          toast.error('Please select a shift');
          return false;
        }
        if (!isAvailable) {
          toast.error('Please check availability before proceeding');
          return false;
        }
        break;
      case 5:
        if (!bookingData.packageId) {
          toast.error('Please select a package');
          return false;
        }
        break;
      case 8:
        if (!bookingData.name || !bookingData.phone) {
          toast.error('Please enter your name and phone number');
          return false;
        }
        if (!/^[0-9]{10}$/.test(bookingData.phone)) {
          toast.error('Please enter a valid 10-digit phone number');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };
  
  const nextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <DateSelection 
          date={bookingData.date} 
          updateBookingData={updateBookingData} 
        />;
      case 1:
        return <EventTypeSelection 
          selectedEventType={bookingData.eventTypeId}
          updateBookingData={updateBookingData} 
        />;
      case 2:
        return <GuestCount 
          guestCount={bookingData.guestCount} 
          updateBookingData={updateBookingData} 
        />;
      case 3:
        return <VenueSelection 
          selectedVenue={bookingData.venueId}
          guestCount={bookingData.guestCount}
          updateBookingData={updateBookingData} 
        />;
      case 4:
        return <ShiftSelection 
          selectedShift={bookingData.shiftId}
          updateBookingData={updateBookingData} 
          checkAvailability={checkVenueAvailability}
          isAvailable={isAvailable}
          isCheckingAvailability={isCheckingAvailability}
        />;
      case 5:
        return <PackageSelection 
          selectedPackage={bookingData.packageId}
          updateBookingData={updateBookingData} 
        />;
      case 6:
        return <MenuSelection 
          selectedPackage={bookingData.packageId}
          selectedMenus={bookingData.selectedMenus}
          updateBookingData={updateBookingData} 
        />;
      case 7:
        return <FareSummary 
          bookingData={bookingData}
          calculateFare={calculateBookingFare}
          isCalculating={isCalculatingFare}
        />;
      case 8:
        return <UserInfo 
          name={bookingData.name}
          phone={bookingData.phone}
          email={bookingData.email}
          updateBookingData={updateBookingData}
          sendOtp={sendOtpToPhone}
        />;
      case 9:
        return <OtpVerification 
          phone={bookingData.phone}
          verifyOtp={verifyOtpCode}
          submitting={submitting}
        />;
      case 10:
        return <BookingConfirmation 
          bookingId={bookingId}
          bookingData={bookingData}
          isComplete={bookingComplete}
        />;
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress steps */}
      <div className="mb-8 hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    index < currentStep
                      ? 'bg-primary-600 text-white border-primary-600'
                      : index === currentStep
                      ? 'border-primary-600 text-primary-600'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    index <= currentStep ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Mobile progress indicator */}
      <div className="mb-6 md:hidden">
        <div className="text-center">
          <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
          <h3 className="text-lg font-medium text-gray-900">{steps[currentStep]}</h3>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Step content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-md p-6 md:p-8"
      >
        {renderStep()}
      </motion.div>
      
      {/* Navigation buttons */}
      {currentStep < 10 && (
        <div className="mt-8 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-md ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Previous
          </button>
          
          {currentStep === 4 && !isAvailable ? (
            <button
              onClick={checkVenueAvailability}
              disabled={isCheckingAvailability}
              className="px-6 py-2 rounded-md bg-secondary-500 text-white hover:bg-secondary-600 disabled:bg-secondary-300"
            >
              {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
            </button>
          ) : currentStep === 7 ? (
            <button
              onClick={calculateBookingFare}
              disabled={isCalculatingFare}
              className="px-6 py-2 rounded-md bg-secondary-500 text-white hover:bg-secondary-600 disabled:bg-secondary-300"
            >
              {isCalculatingFare ? 'Calculating...' : 'Calculate Fare'}
            </button>
          ) : currentStep === 8 ? (
            <button
              onClick={sendOtpToPhone}
              className="px-6 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
            >
              Send OTP
            </button>
          ) : currentStep < 9 && (
            <button
              onClick={nextStep}
              className="px-6 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingWizard;