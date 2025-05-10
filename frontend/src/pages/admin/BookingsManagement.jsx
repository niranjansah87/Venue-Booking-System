
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../services/bookingService';
import { getAllEvents } from '../../services/eventService';
import { getAllVenues } from '../../services/venueService';
import { getAllShifts } from '../../services/shiftService';
import { getAllPackages } from '../../services/packageService';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Mock data for preview
  const mockEvents = [
    { id: 1, name: 'Wedding' },
    { id: 2, name: 'Corporate Event' },
    { id: 3, name: 'Birthday Party' },
  ];
  const mockVenues = [
    { id: 1, name: 'Royal Garden Hall', capacity: 200 },
    { id: 2, name: 'Lakeview Terrace', capacity: 150 },
    { id: 3, name: 'Grand Ballroom', capacity: 300 },
  ];
  const mockShifts = [
    { id: 1, name: 'Morning (9AM-12PM)' },
    { id: 2, name: 'Evening (6PM-9PM)' },
  ];
  const mockPackages = [
    { id: 1, name: 'Premium Package' },
    { id: 2, name: 'Luxury Package' },
  ];
  const generateMockBookings = () => {
    const statuses = ['pending', 'confirmed', 'cancelled'];
    const bookings = [];
    const today = new Date();
    
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      
      bookings.push({
        id: `booking-${i + 1}`,
        event_id: mockEvents[Math.floor(Math.random() * mockEvents.length)].id,
        venue_id: mockVenues[Math.floor(Math.random() * mockVenues.length)].id,
        shift_id: mockShifts[Math.floor(Math.random() * mockShifts.length)].id,
        package_id: mockPackages[Math.floor(Math.random() * mockPackages.length)].id,
        menu_items: [
          { name: `Item ${i + 1}`, price: Math.floor(Math.random() * 20) + 5 },
        ],
        guest_count: Math.floor(Math.random() * 300) + 20,
        event_date: date.toISOString(),
        user_name: `Customer ${i + 1}`,
        user_email: `customer${i + 1}@example.com`,
        total_fare: Math.floor(Math.random() * 50000) + 5000,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created_at: new Date(date.getTime() - Math.floor(Math.random() * 1000000)).toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    return bookings;
  };

  // Fetch bookings and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingData, eventData, venueData, shiftData, packageData] = await Promise.all([
          getAllBookings(),
          getAllEvents(),
          getAllVenues(),
          getAllShifts(),
          getAllPackages(),
        ]);
        
        const mockBookings = generateMockBookings();
        setBookings(bookingData.bookings?.length > 0 ? bookingData.bookings : mockBookings);
        setFilteredBookings(bookingData.bookings?.length > 0 ? bookingData.bookings : mockBookings);
        setEvents(eventData.events?.length > 0 ? eventData.events : mockEvents);
        setVenues(venueData.venues?.length > 0 ? venueData.venues : mockVenues);
        setShifts(shiftData.shifts?.length > 0 ? shiftData.shifts : mockShifts);
        setPackages(packageData.packages?.length > 0 ? packageData.packages : mockPackages);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load bookings or related data');
        
        const mockBookings = generateMockBookings();
        setBookings(mockBookings);
        setFilteredBookings(mockBookings);
        setEvents(mockEvents);
        setVenues(mockVenues);
        setShifts(mockShifts);
        setPackages(mockPackages);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter bookings
  useEffect(() => {
    let result = bookings;
    
    if (selectedStatus !== 'all') {
      result = result.filter((booking) => booking.status === selectedStatus);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((booking) => {
        const eventName = events.find((e) => e.id === booking.event_id)?.name?.toLowerCase() || '';
        const venueName = venues.find((v) => v.id === booking.venue_id)?.name?.toLowerCase() || '';
        return (
          (booking.id && booking.id.toLowerCase().includes(query)) ||
          (booking.user_name && booking.user_name.toLowerCase().includes(query)) ||
          (booking.user_email && booking.user_email.toLowerCase().includes(query)) ||
          eventName.includes(query) ||
          venueName.includes(query)
        );
      });
    }
    
    setFilteredBookings(result);
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, bookings, events, venues]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
            <CheckCircle className="h-4 w-4 mr-1.5" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
            <AlertCircle className="h-4 w-4 mr-1.5" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800">
            <XCircle className="h-4 w-4 mr-1.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Handle action menu toggle
  const toggleActionMenu = (bookingId) => {
    setOpenActionMenu(openActionMenu === bookingId ? null : bookingId);
  };

  // Handle view booking
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
    setOpenActionMenu(null);
  };

  // Handle update status
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setStatusUpdateLoading(true);
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
      setSelectedBooking((prev) =>
        prev && prev.id === bookingId ? { ...prev, status: newStatus } : prev
      );
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (booking) => {
    setBookingToDelete(booking);
    setDeleteConfirmOpen(true);
    setOpenActionMenu(null);
  };

  // Handle delete booking
  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      await deleteBooking(bookingToDelete.id);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingToDelete.id));
      toast.success('Booking deleted successfully');
      setDeleteConfirmOpen(false);
      if (selectedBooking?.id === bookingToDelete.id) {
        setViewModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 text-primary-600 mr-2" />
            Bookings Management
          </h1>
          <p className="text-gray-600 mt-1">View, filter, and manage all venue bookings.</p>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-error-50 p-4 rounded-lg flex items-center"
          >
            <XCircle className="h-5 w-5 text-error-600 mr-2" />
            <p className="text-sm text-error-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto px-3 py-1 bg-error-600 text-white rounded-md hover:bg-error-700"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, customer, venue, or event..."
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all duration-300"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Status:</span>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 mb-6 overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">
                {searchQuery || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No bookings available in the system'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID / Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Venue / Event
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((booking) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{booking.id.substring(0, 8)}</div>
                        <div className="text-xs text-gray-500">{formatDate(booking.event_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.user_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{booking.user_email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {venues.find((v) => v.id === booking.venue_id)?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {events.find((e) => e.id === booking.event_id)?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.guest_count || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(booking.total_fare || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleActionMenu(booking.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </motion.button>
                        {openActionMenu === booking.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10 border border-gray-200"
                          >
                            <button
                              onClick={() => handleViewBooking(booking)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                            >
                              <Eye className="h-4 w-4 mr-2 text-primary-600" />
                              View Details
                            </button>
                            {booking.status !== 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                className="flex items-center w-full px-4 py-2 text-sm text-success-700 hover:bg-success-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-success-600" />
                                Mark as Confirmed
                              </button>
                            )}
                            {booking.status !== 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'pending')}
                                className="flex items-center w-full px-4 py-2 text-sm text-warning-700 hover:bg-warning-50"
                              >
                                <AlertCircle className="h-4 w-4 mr-2 text-warning-600" />
                                Mark as Pending
                              </button>
                            )}
                            {booking.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                className="flex items-center w-full px-4 py-2 text-sm text-error-700 hover:bg-error-50"
                              >
                                <XCircle className="h-4 w-4 mr-2 text-error-600" />
                                Mark as Cancelled
                              </button>
                            )}
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => handleDeleteConfirm(booking)}
                              className="flex items-center w-full px-4 py-2 text-sm text-error-700 hover:bg-error-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2 text-error-600" />
                              Delete Booking
                            </button>
                          </motion.div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-md">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredBookings.length)}</span> of{' '}
              <span className="font-medium">{filteredBookings.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                Previous
              </motion.button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === index + 1
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  {index + 1}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                Next
              </motion.button>
            </div>
          </div>
        )}

        {/* View Booking Modal */}
        <AnimatePresence>
          {viewModalOpen && selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
              onClick={() => setViewModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-6 w-6 text-primary-600 mr-2" />
                    Booking Details
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </motion.button>
                </div>
                <div className="px-6 py-6">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <span className="text-sm text-gray-500">Booking ID</span>
                      <p className="text-lg font-semibold text-gray-900">#{selectedBooking.id}</p>
                    </div>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Booking Details */}
                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Booking Information</h4>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                          <div>
                            <span className="text-sm text-gray-500">Event Date</span>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(selectedBooking.event_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                          <div>
                            <span className="text-sm text-gray-500">Venue / Shift</span>
                            <p className="text-sm font-medium text-gray-900">
                              {venues.find((v) => v.id === selectedBooking.venue_id)?.name || 'N/A'} /{' '}
                              {shifts.find((s) => s.id === selectedBooking.shift_id)?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Users className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                          <div>
                            <span className="text-sm text-gray-500">Event Type / Guests</span>
                            <p className="text-sm font-medium text-gray-900">
                              {events.find((e) => e.id === selectedBooking.event_id)?.name || 'N/A'} /{' '}
                              {selectedBooking.guest_count} guests
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <DollarSign className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                          <div>
                            <span className="text-sm text-gray-500">Total Amount</span>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(selectedBooking.total_fare || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                          <div>
                            <span className="text-sm text-gray-500">Booking Created</span>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(selectedBooking.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Customer Details */}
                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Name</span>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedBooking.user_name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Email</span>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedBooking.user_email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Package and Menu Items */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Package & Menu</h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-500">Package</span>
                        <p className="text-sm font-medium text-gray-900">
                          {packages.find((p) => p.id === selectedBooking.package_id)?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Selected Menu Items</span>
                        <ul className="list-disc pl-5 text-sm text-gray-900">
                          {selectedBooking.menu_items?.map((item, index) => (
                            <li key={index}>
                              {item.name} (₹{item.price})
                            </li>
                          )) || <p className="text-sm text-gray-500">None</p>}
                        </ul>
                      </div>
                    </div>
                  </div>
                  {/* Status Update */}
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Update Status</h4>
                    <div className="flex flex-wrap gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                        disabled={selectedBooking.status === 'confirmed' || statusUpdateLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                          selectedBooking.status === 'confirmed'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-success-100 text-success-800 hover:bg-success-200'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Booking
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'pending')}
                        disabled={selectedBooking.status === 'pending' || statusUpdateLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                          selectedBooking.status === 'pending'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-warning-100 text-warning-800 hover:bg-warning-200'
                        }`}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Mark as Pending
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                        disabled={selectedBooking.status === 'cancelled' || statusUpdateLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                          selectedBooking.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-error-100 text-error-800 hover:bg-error-200'
                        }`}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteConfirm(selectedBooking)}
                      className="px-4 py-2 bg-error-100 text-error-800 rounded-lg hover:bg-error-200 transition-colors"
                    >
                      Delete Booking
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmOpen && bookingToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-error-100 p-3 rounded-full">
                      <Trash2 className="h-8 w-8 text-error-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 text-center mb-3">
                    Delete Booking
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    Are you sure you want to delete the booking for{' '}
                    <span className="font-medium">{bookingToDelete.user_name || 'Unknown Customer'}</span>? This action
                    cannot be undone.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDeleteBooking}
                      className="px-6 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingsManagement;
