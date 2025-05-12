import React from 'react';
import { DollarSign, Calculator, AlertCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const FareSummary = ({ bookingData, calculateFare, isCalculating, sessionId }) => {
  const {
    packageId,
    selectedMenus,
    guestCount,
    totalFare,
    baseFare,
    extraCharges,
    date,
    venueId,
    shiftId,
    event_id,
  } = bookingData;

  const getTotalMenuItems = () => {
    return Object.values(selectedMenus).reduce((total, items) => total + items.length, 0);
  };

  const isFareCalculated = totalFare > 0;

  const handleCalculateFare = async () => {
    try {
      await calculateFare();
      toast.success('Fare calculated successfully!');
    } catch (error) {
      console.error('Error calculating fare:', error);
      toast.error('Failed to calculate fare.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Fare Summary</h2>
      <p className="text-gray-600 mb-8">
        Review your booking details and calculate the total fare.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Booking Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium text-gray-800">
                {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Event Type:</span>
              <span className="font-medium text-gray-800">{event_id ? 'Selected' : 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Guest Count:</span>
              <span className="font-medium text-gray-800">{guestCount || 0} guests</span>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Venue:</span>
              <span className="font-medium text-gray-800">{venueId ? 'Selected' : 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shift:</span>
              <span className="font-medium text-gray-800">{shiftId ? 'Selected' : 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Package:</span>
              <span className="font-medium text-gray-800">{packageId ? 'Selected' : 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Menu Items:</span>
              <span className="font-medium text-gray-800">{getTotalMenuItems()} items selected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Price Calculation</h3>
          {!isFareCalculated && (
            <button
              onClick={handleCalculateFare}
              disabled={isCalculating || isFareCalculated}
              className={`flex items-center px-4 py-2 rounded-md ${
                isCalculating ? 'bg-gray-300 text-gray-600 cursor-wait' : 'bg-secondary-500 text-white hover:bg-secondary-600'
              }`}
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Fare
                </>
              )}
            </button>
          )}
        </div>

        {!isFareCalculated && !isCalculating && (
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-primary-700">
                Click the "Calculate Fare" button to calculate the total cost of your booking.
              </p>
            </div>
          </div>
        )}

        {isCalculating && (
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500 border-r-2 border-b-2 border-gray-200 mb-4"></div>
            <p className="text-gray-700">Calculating your fare...</p>
          </div>
        )}

        {isFareCalculated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-800">Base Package Price</h4>
                <span className="text-lg font-semibold text-gray-900">${baseFare?.toLocaleString() || '0'}</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Package rate</span>
                  <span className="text-gray-700">${(baseFare || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-800">Extra Charges</h4>
                <span className="text-lg font-semibold text-gray-900">${extraCharges?.toLocaleString() || '0'}</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Additional menu items</span>
                  <span className="text-gray-700">${(extraCharges || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-1">Total Fare</h4>
                  <p className="text-sm text-gray-500">For {guestCount} guests</p>
                </div>
                <div className="text-2xl font-bold text-primary-700">${totalFare?.toLocaleString() || '0'}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {isFareCalculated && (
        <div className="p-5 bg-success-50 border border-success-100 rounded-lg flex items-start">
          <Check className="h-6 w-6 text-success-500 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium text-success-700">Your fare has been calculated successfully!</p>
            <p className="text-success-600 mt-1">
              Click "Next" to proceed with your booking. You'll need to provide your contact information in the next step.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FareSummary;