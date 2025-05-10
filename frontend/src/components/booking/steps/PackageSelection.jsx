import React, { useState, useEffect } from 'react';
import { Check, Package, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllPackages } from '../../../services/packageService';
import { toast } from 'react-toastify';

const PackageSelection = ({ selectedPackage, updateBookingData, sessionId }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await getAllPackages(sessionId);
        setPackages(data.packages);
      } catch (error) {
        console.error('Error fetching packages:', error);
        setError('Failed to load packages. Please try again.');
        toast.error('Failed to load packages.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [sessionId]);

  const handlePackageSelect = (packageId) => {
    updateBookingData('packageId', packageId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-error-500 mb-4">{error}</p>
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
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select a Package</h2>
      <p className="text-gray-600 mb-8">
        Choose a package that suits your event needs. Each package includes different amenities and services.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            className={`relative rounded-lg border-2 overflow-hidden transition-all ${
              selectedPackage === pkg.id ? 'border-primary-500' : 'border-gray-200 hover:border-primary-200'
            }`}
          >
            {pkg.recommended && (
              <div className="absolute top-0 right-0 bg-secondary-500 text-white text-xs px-3 py-1 font-medium z-10">
                Recommended
              </div>
            )}
            <div className={`p-6 ${pkg.recommended ? 'bg-gradient-to-r from-primary-50 to-secondary-50' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{pkg.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{pkg.description}</p>
                </div>
                <div className="flex items-center text-lg font-semibold text-gray-800">
                  <DollarSign className="h-5 w-5 text-secondary-500" />
                  {pkg.base_price?.toLocaleString() || 'Custom'}
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {pkg.features?.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-success-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePackageSelect(pkg.id)}
                className={`w-full py-3 rounded-md font-medium transition-colors ${
                  selectedPackage === pkg.id ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {selectedPackage === pkg.id ? 'Selected' : 'Select Package'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedPackage && (
        <div className="mt-8 p-5 bg-primary-50 border border-primary-100 rounded-lg flex items-start">
          <Package className="h-8 w-8 text-primary-500 mr-4 flex-shrink-0 mt-1" />
          <div>
            <p className="text-lg font-medium text-primary-800">
              {packages.find((p) => p.id === selectedPackage)?.name} Package Selected
            </p>
            <p className="text-primary-600 mt-1">
              In the next step, you'll be able to select menu options for this package.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageSelection;