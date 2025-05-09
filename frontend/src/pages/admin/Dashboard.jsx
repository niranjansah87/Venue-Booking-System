import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Users, 
  Calendar, 
  Percent, 
  ArrowUp, 
  ArrowDown, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllBookings } from '../../services/bookingService';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    bookingsThisMonth: 0,
    revenueThisMonth: 0,
    bookingChange: 0,
    revenueChange: 0
  });

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
          calculateStats(mockBookings);
        } else {
          setBookings(data.bookings);
          calculateStats(data.bookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load dashboard data');
        
        // Fallback mock data for development/preview
        const mockBookings = generateMockBookings();
        setBookings(mockBookings);
        calculateStats(mockBookings);
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
          phone: `98765${Math.floor(10000 + Math.random() * 90000)}`
        }
      });
    }
    
    return bookings;
  };

  // Calculate dashboard stats
  const calculateStats = (bookings) => {
    // Get current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter bookings by status
    const pendingBookings = bookings.filter(booking => booking.status === 'pending');
    const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
    const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled');
    
    // Calculate total revenue
    const totalRevenue = bookings.reduce((total, booking) => {
      if (booking.status === 'confirmed') {
        return total + (booking.totalFare || 0);
      }
      return total;
    }, 0);
    
    // Filter bookings for current month
    const currentMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });
    
    // Filter bookings for previous month
    const previousMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getMonth() === previousMonth && bookingDate.getFullYear() === previousMonthYear;
    });
    
    // Calculate revenue for current month
    const currentMonthRevenue = currentMonthBookings.reduce((total, booking) => {
      if (booking.status === 'confirmed') {
        return total + (booking.totalFare || 0);
      }
      return total;
    }, 0);
    
    // Calculate revenue for previous month
    const previousMonthRevenue = previousMonthBookings.reduce((total, booking) => {
      if (booking.status === 'confirmed') {
        return total + (booking.totalFare || 0);
      }
      return total;
    }, 0);
    
    // Calculate changes
    const bookingChange = previousMonthBookings.length !== 0
      ? ((currentMonthBookings.length - previousMonthBookings.length) / previousMonthBookings.length) * 100
      : 100;
    
    const revenueChange = previousMonthRevenue !== 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 100;
    
    setStats({
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      confirmedBookings: confirmedBookings.length,
      cancelledBookings: cancelledBookings.length,
      totalRevenue,
      bookingsThisMonth: currentMonthBookings.length,
      revenueThisMonth: currentMonthRevenue,
      bookingChange,
      revenueChange
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

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
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your venue bookings.</p>
      </header>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
            <div className="p-2 bg-primary-50 rounded-md">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalBookings}</p>
              <div className="flex items-center mt-1">
                {stats.bookingChange >= 0 ? (
                  <>
                    <ArrowUp className="h-4 w-4 text-success-500" />
                    <span className="text-sm font-medium text-success-600">
                      {Math.abs(stats.bookingChange).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 text-error-500" />
                    <span className="text-sm font-medium text-error-600">
                      {Math.abs(stats.bookingChange).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="h-10 w-16 bg-gray-100 rounded-md"></div>
          </div>
        </motion.div>
        
        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
            <div className="p-2 bg-secondary-50 rounded-md">
              <DollarSign className="h-5 w-5 text-secondary-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.revenueThisMonth)}</p>
              <div className="flex items-center mt-1">
                {stats.revenueChange >= 0 ? (
                  <>
                    <ArrowUp className="h-4 w-4 text-success-500" />
                    <span className="text-sm font-medium text-success-600">
                      {Math.abs(stats.revenueChange).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 text-error-500" />
                    <span className="text-sm font-medium text-error-600">
                      {Math.abs(stats.revenueChange).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="h-10 w-16 bg-gray-100 rounded-md"></div>
          </div>
        </motion.div>
        
        {/* Pending Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
            <div className="p-2 bg-warning-50 rounded-md">
              <Clock className="h-5 w-5 text-warning-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingBookings}</p>
              <p className="text-xs text-gray-500 mt-1">
                Requires action
              </p>
            </div>
            <div className="text-xs text-white bg-warning-500 py-1 px-2 rounded-full">
              {stats.pendingBookings > 0 ? 'Action needed' : 'All clear'}
            </div>
          </div>
        </motion.div>
        
        {/* Conversion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <div className="p-2 bg-success-50 rounded-md">
              <Percent className="h-5 w-5 text-success-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalBookings > 0 
                  ? `${((stats.confirmedBookings / stats.totalBookings) * 100).toFixed(1)}%` 
                  : '0%'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.confirmedBookings} confirmed of {stats.totalBookings}
              </p>
            </div>
            <div className="h-10 w-16 bg-gray-100 rounded-md"></div>
          </div>
        </motion.div>
      </div>
      
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-800">Recent Bookings</h3>
            <a href="/admin/bookings" className="text-sm text-primary-600 hover:text-primary-800">
              View All
            </a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.map((booking, index) => (
                  <tr key={booking.id || index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">
                        #{booking.id.substring(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {booking.customer?.name || 'N/A'}
                        </span>
                        <p className="text-xs text-gray-500">
                          {booking.customer?.phone || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <span className="text-sm text-gray-900">
                          {booking.venue || 'N/A'}
                        </span>
                        <p className="text-xs text-gray-500">
                          {booking.eventType || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.totalFare || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-success-50 text-success-700'
                          : booking.status === 'pending'
                          ? 'bg-warning-50 text-warning-700'
                          : 'bg-error-50 text-error-700'
                      }`}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {/* Booking Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-medium text-gray-800 mb-6">Booking Status</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Confirmed</span>
                <span className="text-sm text-gray-600">
                  {stats.confirmedBookings}/{stats.totalBookings}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-success-500 h-2 rounded-full" 
                  style={{ width: `${stats.totalBookings > 0 ? (stats.confirmedBookings / stats.totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pending</span>
                <span className="text-sm text-gray-600">
                  {stats.pendingBookings}/{stats.totalBookings}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-warning-500 h-2 rounded-full" 
                  style={{ width: `${stats.totalBookings > 0 ? (stats.pendingBookings / stats.totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Cancelled</span>
                <span className="text-sm text-gray-600">
                  {stats.cancelledBookings}/{stats.totalBookings}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-error-500 h-2 rounded-full" 
                  style={{ width: `${stats.totalBookings > 0 ? (stats.cancelledBookings / stats.totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-success-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-success-700">Confirmed</p>
              <p className="text-lg font-bold text-success-800">{stats.confirmedBookings}</p>
            </div>
            
            <div className="p-3 bg-warning-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-warning-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-warning-700">Pending</p>
              <p className="text-lg font-bold text-warning-800">{stats.pendingBookings}</p>
            </div>
            
            <div className="p-3 bg-error-50 rounded-lg">
              <XCircle className="h-6 w-6 text-error-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-error-700">Cancelled</p>
              <p className="text-lg font-bold text-error-800">{stats.cancelledBookings}</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <a 
          href="/admin/bookings"
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Manage Bookings</h3>
            <p className="text-sm text-gray-500">View and update all bookings</p>
          </div>
          <Calendar className="h-8 w-8 text-primary-500" />
        </a>
        
        <a 
          href="/admin/venues"
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Manage Venues</h3>
            <p className="text-sm text-gray-500">Update venue details</p>
          </div>
          <MapPin className="h-8 w-8 text-primary-500" />
        </a>
        
        <a 
          href="/admin/packages"
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Manage Packages</h3>
            <p className="text-sm text-gray-500">Update package pricing</p>
          </div>
          <Package className="h-8 w-8 text-primary-500" />
        </a>
        
        <a 
          href="/admin/users"
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Manage Users</h3>
            <p className="text-sm text-gray-500">View customer accounts</p>
          </div>
          <Users className="h-8 w-8 text-primary-500" />
        </a>
      </motion.div>
    </div>
  );
};

export default Dashboard;