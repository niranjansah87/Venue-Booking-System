import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Edit, Trash2, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllShifts, createShift, updateShift, deleteShift } from '../../services/shiftService';

const ShiftsManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    start_time: '',
    end_time: '',
    description: '',
    shift_type: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const shiftTypes = [
    { value: 'morning', label: 'Morning 🌅', emoji: '🌅' },
    { value: 'afternoon', label: 'Afternoon ☀️', emoji: '☀️' },
    { value: 'evening', label: 'Evening 🌙', emoji: '🌙' },
  ];

  const mockShifts = [
    {
      id: 1,
      name: 'Morning Shift',
      start_time: '09:00',
      end_time: '12:00',
      description: 'Morning event shift',
      shift_type: 'morning',
    },
    {
      id: 2,
      name: 'Afternoon Shift',
      start_time: '13:00',
      end_time: '16:00',
      description: 'Afternoon event shift',
      shift_type: 'afternoon',
    },
    {
      id: 3,
      name: 'Evening Shift',
      start_time: '18:00',
      end_time: '21:00',
      description: 'Evening event shift',
      shift_type: 'evening',
    },
  ];

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        const data = await getAllShifts();
        if (!data?.shifts || data.shifts.length === 0) {
          setShifts(mockShifts);
        } else {
          setShifts(data.shifts);
        }
      } catch (error) {
        console.error('Error fetching shifts:', error);
        setError('Failed to load shifts');
        setShifts(mockShifts);
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'shift_type') {
      let start = '';
      let end = '';
      if (value === 'morning') {
        start = '06:00';
        end = '12:00';
      } else if (value === 'afternoon') {
        start = '12:00';
        end = '18:00';
      } else if (value === 'evening') {
        start = '18:00';
        end = '23:00';
      }
      setFormData((prev) => ({
        ...prev,
        shift_type: value,
        start_time: start,
        end_time: end,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Shift name is required';
    if (!formData.start_time) errors.start_time = 'Start time is required';
    if (!formData.end_time) errors.end_time = 'End time is required';
    if (!formData.shift_type) errors.shift_type = 'Shift type is required';
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      errors.end_time = 'End time must be after start time';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const shiftData = {
        name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        description: formData.description,
        shift_type: formData.shift_type,
      };

      let response;
      if (formData.id) {
        response = await updateShift(formData.id, shiftData);
        setShifts((prev) =>
          prev.map((shift) =>
            shift.id === formData.id ? { ...shift, ...response } : shift
          )
        );
        toast.success('Shift updated successfully', { icon: <CheckCircle className="h-5 w-5" /> });
      } else {
        response = await createShift(shiftData);
        setShifts((prev) => [...prev, response]);
        toast.success('Shift created successfully', { icon: <CheckCircle className="h-5 w-5" /> });
      }

      resetForm();
    } catch (error) {
      console.error('Error saving shift:', error.message, error.response?.data);
      setError(error.message || 'Failed to save shift');
      toast.error(error.message || 'Failed to save shift', { icon: <XCircle className="h-5 w-5" /> });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shift) => {
    setFormData({
      id: shift.id,
      name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      description: shift.description || '',
      shift_type: shift.shift_type,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteShift(id);
      setShifts((prev) => prev.filter((shift) => shift.id !== id));
      setDeleteConfirm(null);
      toast.success('Shift deleted successfully', { icon: <CheckCircle className="h-5 w-5" /> });
    } catch (error) {
      console.error('Error deleting shift:', error.message);
      setError(error.message || 'Failed to delete shift');
      toast.error(error.message || 'Failed to delete shift', { icon: <XCircle className="h-5 w-5" /> });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      start_time: '',
      end_time: '',
      description: '',
      shift_type: '',
    });
    setFormErrors({});
    setShowForm(false);
  };

  if (loading && shifts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 border-4 border-accent-600 border-t-primary-800 rounded-full"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="p-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-extrabold text-primary-800 flex items-center relative">
            <Clock className="h-12 w-12 text-accent-600 mr-4" />
            Shift Management
            <span className="absolute -bottom-2 left-0 w-32 h-1 bg-accent-600 rounded-full"></span>
          </h1>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(13, 148, 136, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-700 text-white font-bold text-lg rounded-xl shadow-lg border border-accent-700/20 hover:from-accent-700 hover:to-accent-800 focus:outline-none focus:ring-4 focus:ring-accent-600/50 transition-all duration-300"
            aria-label="Add new shift"
          >
            <Plus className="h-6 w-6 mr-3" />
            Add Shift
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-error-50 p-4 rounded-xl flex items-center shadow-md"
          >
            <XCircle className="h-6 w-6 text-error-600 mr-3" />
            <p className="text-base font-medium text-error-700">{error}</p>
          </motion.div>
        )}

        {/* Shifts Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {shifts.length > 0 ? (
            shifts.map((shift) => (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(13, 148, 136, 0.3)' }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                className="bg-card-50 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center aspect-square border border-gray-200 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-primary-800 text-center flex items-center mb-4">
                  <span className="text-2xl mr-2">{shiftTypes.find((t) => t.value === shift.shift_type)?.emoji || '⏰'}</span>
                  {shift.name}
                </h3>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.1, boxShadow: '0 0 12px rgba(13, 148, 136, 0.5)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(shift)}
                    className="p-3 bg-accent-600 text-white rounded-full border border-white/30 hover:bg-accent-700 shadow-glow transition-all duration-200"
                    title="Edit Shift"
                    aria-label={`Edit ${shift.name}`}
                  >
                    <Edit className="h-6 w-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, boxShadow: '0 0 12px rgba(220, 38, 38, 0.5)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteConfirm(shift.id)}
                    className="p-3 bg-error-600 text-white rounded-full border border-white/30 hover:bg-error-700 shadow-glow-error transition-all duration-200"
                    title="Delete Shift"
                    aria-label={`Delete ${shift.name}`}
                  >
                    <Trash2 className="h-6 w-6" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-primary-700 col-span-full text-xl font-medium">No shifts available</p>
          )}
        </motion.div>

        {/* Shift Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-6 z-50"
              role="dialog"
              aria-labelledby="form-title"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 150 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
              >
                <button
                  onClick={resetForm}
                  className="absolute top-4 right-4 text-primary-700 hover:text-primary-800 transition-colors duration-200"
                  aria-label="Close form"
                >
                  <XCircle className="h-7 w-7" />
                </button>
                <h2 id="form-title" className="text-3xl font-extrabold text-primary-800 mb-6">
                  {formData.id ? 'Edit Shift' : 'Create Shift'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <label className="block text-base font-medium text-primary-700">Shift Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-2 block w-full rounded-xl border ${formErrors.name ? 'border-error-600' : 'border-gray-200'} bg-white px-4 py-3 text-base focus:border-accent-600 focus:ring-2 focus:ring-accent-600/50 transition-all duration-300`}
                      aria-invalid={formErrors.name ? 'true' : 'false'}
                      aria-describedby={formErrors.name ? 'name-error' : undefined}
                    />
                    <AnimatePresence>
                      {formErrors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          id="name-error"
                          className="mt-1 text-sm text-error-600 font-medium"
                        >
                          {formErrors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-primary-700">Shift Type</label>
                    <select
                      name="shift_type"
                      value={formData.shift_type}
                      onChange={handleInputChange}
                      className={`mt-2 block w-full rounded-xl border ${formErrors.shift_type ? 'border-error-600' : 'border-gray-200'} bg-white px-4 py-3 text-base focus:border-accent-600 focus:ring-2 focus:ring-accent-600/50 transition-all duration-300`}
                      aria-invalid={formErrors.shift_type ? 'true' : 'false'}
                      aria-describedby={formErrors.shift_type ? 'shift-type-error' : undefined}
                    >
                      <option value="">Select Shift Type</option>
                      {shiftTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <AnimatePresence>
                      {formErrors.shift_type && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          id="shift-type-error"
                          className="mt-1 text-sm text-error-600 font-medium"
                        >
                          {formErrors.shift_type}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-primary-700">Start Time</label>
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      className={`mt-2 block w-full rounded-xl border ${formErrors.start_time ? 'border-error-600' : 'border-gray-200'} bg-white px-4 py-3 text-base focus:border-accent-600 focus:ring-2 focus:ring-accent-600/50 transition-all duration-300`}
                      aria-invalid={formErrors.start_time ? 'true' : 'false'}
                      aria-describedby={formErrors.start_time ? 'start-time-error' : undefined}
                    />
                    <AnimatePresence>
                      {formErrors.start_time && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          id="start-time-error"
                          className="mt-1 text-sm text-error-600 font-medium"
                        >
                          {formErrors.start_time}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-primary-700">End Time</label>
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      className={`mt-2 block w-full rounded-xl border ${formErrors.end_time ? 'border-error-600' : 'border-gray-200'} bg-white px-4 py-3 text-base focus:border-accent-600 focus:ring-2 focus:ring-accent-600/50 transition-all duration-300`}
                      aria-invalid={formErrors.end_time ? 'true' : 'false'}
                      aria-describedby={formErrors.end_time ? 'end-time-error' : undefined}
                    />
                    <AnimatePresence>
                      {formErrors.end_time && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          id="end-time-error"
                          className="mt-1 text-sm text-error-600 font-medium"
                        >
                          {formErrors.end_time}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative">
                    <label className="block text-base font-medium text-primary-700">Description (optional)</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base focus:border-accent-600 focus:ring-2 focus:ring-accent-600/50 transition-all duration-300"
                      rows="4"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-200 text-primary-800 font-semibold rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300/50 transition-all duration-300"
                      aria-label="Cancel form"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(13, 148, 136, 0.5)' }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white font-semibold rounded-xl hover:from-accent-700 hover:to-accent-800 disabled:opacity-50 flex items-center focus:outline-none focus:ring-4 focus:ring-accent-600/50 transition-all duration-300"
                      aria-label={formData.id ? 'Update shift' : 'Create shift'}
                    >
                      {loading && (
                        <motion.svg
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </motion.svg>
                      )}
                      {loading ? 'Saving...' : formData.id ? 'Update' : 'Create'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-6 z-50"
              role="dialog"
              aria-labelledby="delete-title"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 150 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
              >
                <h2 id="delete-title" className="text-3xl font-extrabold text-primary-800 mb-6 flex items-center">
                  <AlertCircle className="h-7 w-7 text-error-600 mr-3" />
                  Confirm Deletion
                </h2>
                <p className="text-base text-primary-700 mb-8">
                  Are you sure you want to delete this shift? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(null)}
                    className="px-6 py-3 bg-gray-200 text-primary-800 font-semibold rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300/50 transition-all duration-300"
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(220, 38, 38, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-6 py-3 bg-gradient-to-r from-error-600 to-error-700 text-white font-semibold rounded-xl hover:from-error-700 hover:to-error-800 flex items-center focus:outline-none focus:ring-4 focus:ring-error-600/50 transition-all duration-300"
                    aria-label="Confirm deletion"
                  >
                    {loading && (
                      <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </motion.svg>
                    )}
                    {loading ? 'Deleting...' : 'Delete'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShiftsManagement;