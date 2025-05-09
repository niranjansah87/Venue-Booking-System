import React, { useState, useEffect } from 'react';
import { Check, Package, DollarSign, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllPackages } from '../../../services/packageService';

const PackageSelection = ({ selectedPackage, updateBookingData }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await getAllPackages();
        
        // For development/preview - mock data if API fails or returns empty
        if (!data.packages || data.packages.length === 0) {
          const mockPackages = [
            {
              id: '1',
              name: 'Basic',
              base_price: 5000,
              description: 'Essential services for a simple event',
              features: ['Standard decoration', 'Basic sound system', 'Standard lighting', 'Basic seating arrangement'],
              recommended: false,
              category: 'budget'
            },
            {
              id: '2',
              name: 'Premium',
              base_price: 12000,
              description: 'Enhanced services with premium features',
              features: ['Premium decoration', 'Advanced sound system', 'Mood lighting', 'Premium seating with covers', 'Photography service', 'Welcome drinks'],
              recommended: true,
              category: 'premium'
            },
            {
              id: '3',
              name: 'Deluxe',
              base_price: 20000,
              description: 'Complete solution with luxury amenities',
              features: ['Luxury decoration', 'Professional sound system', 'Dynamic lighting setup', 'Premium seating with covers', 'Photography & videography', 'Welcome drinks & mocktails', 'VIP reception area', '2-tier cake'],
              recommended: false,
              category: 'luxury'
            },
            {
              id: '4',
              name: 'Wedding Special',
              base_price: 25000,
              description: 'Specially designed for wedding ceremonies',
              features: ['Wedding stage decoration', 'Professional sound & lighting', 'Premium seating with covers', 'Photography & videography', 'Bridal suite', 'Welcome drinks & mocktails', 'Wedding cake', 'Flower arrangements'],
              recommended: false,
              category: 'wedding'
            }
          ];
          setPackages(mockPackages);
        } else {
          setPackages(data.packages);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        setError('Failed to load packages. Please try again.');
        
        // Fallback mock data for development/preview
        setPackages([
          {
            id: '1',
            name: 'Basic',
            base_price: 5000,
            description: 'Essential services for a simple event',
            features: ['Standard decoration', 'Basic sound system', 'Standard lighting', 'Basic seating arrangement'],
            recommended: false,
            category: 'budget'
          },
          {
            id: '2',
            name: 'Premium',
            base_price: 12000,
            description: 'Enhanced services with premium features',
            features: ['Premium decoration', 'Advanced sound system', 'Mood lighting', 'Premium seating with covers', 'Photography service', 'Welcome drinks'],
            recommended: true,
            category: 'premium'
          },
          {
            id: '3',
            name: 'Deluxe',
            base_price: 20000,
            description: 'Complete solution with luxury amenities',
            features: ['Luxury decoration', 'Professional sound system', 'Dynamic lighting setup', 'Premium seating with covers', 'Photography & videography', 'Welcome drinks & mocktails', 'VIP reception area', '2-tier cake'],
            recommended: false,
            category: 'luxury'
          },
          {
            id: '4',
            name: 'Wedding Special',
            base_price: 25000,
            description: 'Specially designed for wedding ceremonies',
            features: ['Wedding stage decoration', 'Professional sound & lighting', 'Premium seating with covers', 'Photography & videography', 'Bridal suite', 'Welcome drinks & mocktails', 'Wedding cake', 'Flower arrangements'],
            recommended: false,
            category: 'wedding'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Handle package selection
  const handlePackageSelect = (packageId) => {
    updateBookingData('packageId', packageId);
  };

  // Filter packages based on selected tab
  const filteredPackages = selectedTab === 'all' 
    ? packages 
    : packages.filter(pkg => pkg.category === selectedTab);

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

  // Get unique categories from packages
  const categories = ['all', ...new Set(packages.map(pkg => pkg.category || 'other'))];

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select a Package</h2>
      <p className="text-gray-600 mb-8">
        Choose a package that suits your event needs. Each package includes different amenities and services.
      </p>
      
      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedTab(category)}
              className={`px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-colors ${
                selectedTab === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPackages.map((pkg) => (
          <motion.div
            key={pkg.id}
            whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            className={`relative rounded-lg border-2 overflow-hidden transition-all ${
              selectedPackage === pkg.id
                ? 'border-primary-500'
                : 'border-gray-200 hover:border-primary-200'
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
                  selectedPackage === pkg.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {selectedPackage === pkg.id ? 'Selected' : 'Select Package'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Package Info Box */}
      {selectedPackage && (
        <div className="mt-8 p-5 bg-primary-50 border border-primary-100 rounded-lg flex items-start">
          <Package className="h-8 w-8 text-primary-500 mr-4 flex-shrink-0 mt-1" />
          <div>
            <p className="text-lg font-medium text-primary-800">
              {packages.find(p => p.id === selectedPackage)?.name} Package Selected
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