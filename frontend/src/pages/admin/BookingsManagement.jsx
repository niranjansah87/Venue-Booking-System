import React, { useState, useEffect } from 'react';
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
  Edit,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../services/bookingService';
import { toast } from 'react-toastify';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
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
  
  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getAllBookings();
        
        // For development/preview - mock data if API fails or returns empty
        if (!data.bookings || data.bookings.length === 0) {
          const mockBookings = generateMockBookings();
          setBookings(mockBookings);
          setFilteredBookings(mockBookings);
        } else {
          setBookings(data.bookings);
          setFilteredBookings(data.bookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings data');
        
        // Fallback mock data for development/preview
        const mockBookings = generateMockBookings();
        setBookings(mockBookings);
        setFilteredBookings(mockBookings);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Generate mock bookings for preview
  const generateMockBookings = () => {
    const statuses = ['pending', 'confirmed', 'cancelled'];
    const venues = ['Royal Garden Hall', 'Lakeview Terrace', 'Grand Ballroom', 'Urban Loft'];
    const events = ['Wedding', 'Corporate Event', 'Birthday Party', 'Anniversary'];
    const bookings = [];
    
    // Generate bookings for the past 3 months
    const today = new Date();
    
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      
      bookings.push({
        id: `booking-${i + 1}`,
        date: date.toISOString(),
        guestCount: Math.floor(Math.random() * 300) + 20,
        eventType: events[Math.floor(Math.random() * events.length)],
        venue: venues[Math.floor(Math.random() * venues.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        totalFare: Math.floor(Math.random() * 50000) + 5000,
        customer: {
          name: `Customer ${i + 1}`,
          phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
          email: `customer${i + 1}@example.com`
        },
        createdAt: new Date(date.getTime() - Math.floor(Math.random() * 1000000)).toISOString()
      });
    }
    
    return bookings;
  };

  // Filter bookings based on search query and status
  useEffect(() => {
    let result = bookings;
    
    // Filter by status
    if (selectedStatus !== 'all') {
      result = result.filter(booking => booking.status === selectedStatus);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(booking => 
        (booking.id && booking.id.toLowerCase().includes(query)) ||
        (booking.customer?.name && booking.customer.name.toLowerCase().includes(query)) ||
        (booking.customer?.phone && booking.customer.phone.includes(query)) ||
        (booking.venue && booking.venue.toLowerCase().includes(query))
      );
    }
    
    setFilteredBookings(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchQuery, selectedStatus, bookings]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning-50 text-warning-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-error-50 text-error-700">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  // Handle action menu toggle
  const toggleActionMenu = (bookingId) => {
    if (openActionMenu === bookingId) {
      setOpenActionMenu(null);
    } else {
      setOpenActionMenu(bookingId);
    }
  };

  // Handle view booking details
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
    setOpenActionMenu(null);
  };

  // Handle update booking status
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setStatusUpdateLoading(true);
    try {
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
      
      setBookings(updatedBookings);
      setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
      
      // For demonstration purposes - update status anyway
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
      
      setBookings(updatedBookings);
      setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Handle delete booking confirmation
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
      
      // Update local state
      const updatedBookings = bookings.filter(booking => booking.id !== bookingToDelete.id);
      setBookings(updatedBookings);
      
      toast.success('Booking deleted successfully');
      
      // Close modals
      setDeleteConfirmOpen(false);
      if (selectedBooking?.id === bookingToDelete.id) {
        setViewModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
      
      // For demonstration purposes - delete anyway
      const updatedBookings = bookings.filter(booking => booking.id !== bookingToDelete.id);
      setBookings(updatedBookings);
      setDeleteConfirmOpen(false);
      if (selectedBooking?.id === bookingToDelete.id) {
        setViewModalOpen(false);
      }
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Handle page change
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-error-50 text-error-700 p-4 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Bookings Management</h1>
        <p className="text-gray-600">View, filter and manage all venue bookings.</p>
      </header>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings by ID, customer, or venue..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">Status:</span>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-500">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try changing your search or filter criteria'
                : 'There are no bookings in the system yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue / Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((booking) => (
                  <tr 
                    key={booking.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{booking.id.substring(0, 8)}</div>
                      <div className="text-xs text-gray-500">{formatDate(booking.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.customer?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{booking.customer?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.venue || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{booking.eventType || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.guestCount || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(booking.totalFare || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={() => toggleActionMenu(booking.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {openActionMenu === booking.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                          >
                            <Eye className="h-4 w-4 mr-2 text-gray-500" />
                            View Details
                          </button>
                          {booking.status !== 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-success-500" />
                              Mark as Confirmed
                            </button>
                          )}
                          {booking.status !== 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'pending')}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                            >
                              <AlertCircle className="h-4 w-4 mr-2 text-warning-500" />
                              Mark as Pending
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                            >
                              <XCircle className="h-4 w-4 mr-2 text-error-500" />
                              Mark as Cancelled
                            </button>
                          )}
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleDeleteConfirm(booking)}
                            className="flex items-center w-full px-4 py-2 text-sm text-error-700 hover:bg-error-50 text-left"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Booking
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredBookings.length)}
            </span>{' '}
            of <span className="font-medium">{filteredBookings.length}</span> results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === index + 1
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next
            </button>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Booking Details
                </h3>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="px-6 py-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Booking ID</span>
                    <p className="text-lg font-medium text-gray-900">#{selectedBooking.id}</p>
                  </div>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Booking Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-800 mb-4">Booking Information</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-gray-500">Event Date</span>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(selectedBooking.date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-gray-500">Venue</span>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedBooking.venue || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Users className="h-5 w-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-gray-500">Event Type / Guests</span>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedBooking.eventType || 'N/A'} / {selectedBooking.guestCount} guests
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <DollarSign className="h-5 w-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-gray-500">Total Amount</span>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(selectedBooking.totalFare || 0)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-gray-500">Booking Created</span>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(selectedBooking.createdAt || selectedBooking.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Customer Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-800 mb-4">Customer Information</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-500">Name</span>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedBooking.customer?.name || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Phone</span>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedBooking.customer?.phone || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Email</span>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedBooking.customer?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status Update */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-4">Update Status</h4>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                      disabled={selectedBooking.status === 'confirmed' || statusUpdateLoading}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                        selectedBooking.status === 'confirmed'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-success-50 text-success-700 hover:bg-success-100'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </button>
                    
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'pending')}
                      disabled={selectedBooking.status === 'pending' || statusUpdateLoading}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                        selectedBooking.status === 'pending'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-warning-50 text-warning-700 hover:bg-warning-100'
                      }`}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Mark as Pending
                    </button>
                    
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                      disabled={selectedBooking.status === 'cancelled' || statusUpdateLoading}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                        selectedBooking.status === 'cancelled'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-error-50 text-error-700 hover:bg-error-100'
                      }`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleDeleteConfirm(selectedBooking)}
                    className="px-4 py-2 bg-error-50 text-error-700 rounded-md hover:bg-error-100 transition-colors"
                  >
                    Delete Booking
                  </button>
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-error-100 p-3 rounded-full">
                    <Trash2 className="h-6 w-6 text-error-600" />
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 text-center mb-2">
                  Delete Booking
                </h3>
                
                <p className="text-gray-500 text-center mb-6">
                  Are you sure you want to delete the booking for{' '}
                  <span className="font-medium">{bookingToDelete.customer?.name || 'Unknown Customer'}</span>?
                  This action cannot be undone.
                </p>
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteBooking}
                    className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingsManagement;