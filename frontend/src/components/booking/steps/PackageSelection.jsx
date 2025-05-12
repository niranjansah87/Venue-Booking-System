import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const PackageSelection = ({ packageId, updateBookingData }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get('/api/admin/package');
        setPackages(response.data.packages || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast.error('Failed to load packages.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handlePackageChange = (e) => {
    updateBookingData('packageId', parseInt(e.target.value));
  };

  return (
    <div>
      <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6">Select Package</h2>
      <p className="text-gray-600 mb-8">Choose a package that suits your event.</p>

      {loading ? (
        <p>Loading packages...</p>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            {packages.map((pkg) => (
              <motion.label
                key={pkg.id}
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="radio"
                  name="package"
                  value={pkg.id}
                  checked={packageId === pkg.id}
                  onChange={handlePackageChange}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-800">{pkg.name} - ${pkg.price}</span>
              </motion.label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageSelection;