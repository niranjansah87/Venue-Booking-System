import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Edit, Trash2, XCircle } from 'lucide-react';
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
        if (!data || !data.shifts || data.shifts.length === 0) {
          setShifts(data);
        } else {
          setShifts(mockShifts);
        }
      } catch (error) {
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

      if (formData.id) {
        const response = await updateShift(formData.id, shiftData);
        setShifts((prev) =>
          prev.map((shift) =>
            shift.id === formData.id ? { ...shift, ...response } : shift
          )
        );
      } else {
        const response = await createShift(shiftData);
        setShifts((prev) => [...prev, response]);
      }

      resetForm();
    } catch (error) {
      setError('Failed to save shift');
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
    } catch (error) {
      setError('Failed to delete shift');
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Clock className="h-8 w-8 text-primary-600 mr-2" />
            Shifts Management
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Shift
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-100 p-4 rounded-lg flex items-center"
          >
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Shift Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shifts.length > 0 ? (
            shifts.map((shift) => (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <h3 className="text-lg font-semibold flex items-center">
                  {shiftTypes.find((t) => t.value === shift.shift_type)?.emoji || '⏰'} {shift.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {shift.start_time} - {shift.end_time}
                </p>
                <p className="text-sm mt-1 text-gray-600 line-clamp-2">{shift.description}</p>
                <div className="mt-4 flex space-x-2">
                  <button onClick={() => handleEdit(shift)} className="text-primary-600">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(shift.id)} className="text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">No shifts available</p>
          )}
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md">
              <h3 className="font-semibold text-lg">Delete this shift?</h3>
              <div className="flex mt-4 gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="bg-gray-300 px-4 py-2 rounded">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 text-white px-4 py-2 rounded">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shift Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg">
              <h2 className="text-xl font-semibold mb-4">{formData.id ? 'Edit Shift' : 'Create Shift'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Shift Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  />
                  {formErrors.name && <p className="text-sm text-red-600">{formErrors.name}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  />
                  {formErrors.end_time && <p className="text-sm text-red-600">{formErrors.end_time}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Shift Type</label>
                  <select
                    name="shift_type"
                    value={formData.shift_type}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="">Select Shift Type</option>
                    {shiftTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.shift_type && <p className="text-sm text-red-600">{formErrors.shift_type}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Description (optional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div className="flex justify-between">
                  <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">
                    Cancel
                  </button>
                  <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">
                    Save Shift
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftsManagement;
