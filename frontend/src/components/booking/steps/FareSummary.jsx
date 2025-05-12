import React from 'react';
import { DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

const FareSummary = ({ baseFare, extraCharges, totalFare, calculateFare, isCalculating }) => {
  const { user } = useAuth();

  const handleCalculateFare = async () => {
    if (!user?.id) {
      toast.error('Please log in to calculate fare.');
      return;
    }
    await calculateFare();
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Fare Summary</h2>
      <p className="text-gray-600 mb-8">Review the estimated costs for your event.</p>

      <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg">
        <div className="space-y-4">
          <div className="flex justify-between text-gray-800">
            <span>Base Fare:</span>
            <span>${baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-800">
            <span>Extra Charges:</span>
            <span>${extraCharges.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total Fare:</span>
            <span>${totalFare.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={handleCalculateFare}
          disabled={isCalculating}
          className={`mt-6 w-full px-6 py-3 rounded-md flex items-center justify-center ${
            isCalculating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          <DollarSign className="h-5 w-5 mr-2" />
          {isCalculating ? 'Calculating...' : 'Calculate Fare'}
        </button>
      </div>
    </div>
  );
};

export default FareSummary;