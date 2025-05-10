
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Package,
} from 'lucide-react';
import { getAllBookings } from '../../services/bookingService';
import { getAllEvents } from '../../services/eventService';
import { getAllVenues } from '../../services/venueService';
import { getAllShifts } from '../../services/shiftService';
import { getAllPackages } from '../../services/packageService';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    bookingsThisMonth: 0,
    bookingChange: 0,
  });

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
        const bookingsToUse = bookingData.bookings?.length > 0 ? bookingData.bookings : mockBookings;
        setBookings(bookingsToUse);
        calculateStats(bookingsToUse);
        setEvents(eventData.events?.length > 0 ? eventData.events : mockEvents);
        setVenues(venueData.venues?.length > 0 ? venueData.venues : mockVenues);
        setShifts(shiftData.shifts?.length > 0 ? shiftData.shifts : mockShifts);
        setPackages(packageData.packages?.length > 0 ? packageData.packages : mockPackages);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data');

        const mockBookings = generateMockBookings();
        setBookings(mockBookings);
        calculateStats(mockBookings);
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

  // Calculate dashboard stats
  const calculateStats = (bookings) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const pendingBookings = bookings.filter((booking) => booking.status === 'pending');
    const confirmedBookings = bookings.filter((booking) => booking.status === 'confirmed');
    const cancelledBookings = bookings.filter((booking) => booking.status === 'cancelled');

    const currentMonthBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.event_date);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });

    const previousMonthBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.event_date);
      return bookingDate.getMonth() === previousMonth && bookingDate.getFullYear() === previousMonthYear;
    });

    const bookingChange = previousMonthBookings.length !== 0
      ? ((currentMonthBookings.length - previousMonthBookings.length) / previousMonthBookings.length) * 100
      : 100;

    setStats({
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      confirmedBookings: confirmedBookings.length,
      cancelledBookings: cancelledBookings.length,
      bookingsThisMonth: currentMonthBookings.length,
      bookingChange,
    });
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

  // Filter recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
    .slice(0, 5);

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
            <BarChart className="h-8 w-8 text-primary-600 mr-2" />
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your venue bookings.</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Total Bookings</h3>
              <div className="p-2 bg-primary-100 rounded-full">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                <div className="flex items-center mt-2">
                  {stats.bookingChange >= 0 ? (
                    <>
                      <ArrowUp className="h-4 w-4 text-success-600" />
                      <span className="text-sm font-medium text-success-700">
                        {Math.abs(stats.bookingChange).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4 text-error-600" />
                      <span className="text-sm font-medium text-error-700">
                        {Math.abs(stats.bookingChange).toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bookings This Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Bookings This Month</h3>
              <div className="p-2 bg-primary-100 rounded-full">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.bookingsThisMonth}</p>
                <p className="text-xs text-gray-500 mt-2">Current month activity</p>
              </div>
            </div>
          </motion.div>

          {/* Pending Approvals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Pending Approvals</h3>
              <div className="p-2 bg-warning-100 rounded-full">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</p>
                <p className="text-xs text-gray-500 mt-2">Requires action</p>
              </div>
              <div className="text-xs text-white bg-warning-600 py-1 px-2 rounded-full">
                {stats.pendingBookings > 0 ? 'Action needed' : 'All clear'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                Recent Bookings
              </h3>
              <a href="/admin/bookings" className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                View All
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentBookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">#{booking.id.substring(0, 8)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{formatDate(booking.event_date)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{booking.user_name || 'N/A'}</span>
                          <p className="text-xs text-gray-500">{booking.user_email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <span className="text-sm text-gray-900">
                            {venues.find((v) => v.id === booking.venue_id)?.name || 'N/A'}
                          </span>
                          <p className="text-xs text-gray-500">
                            {events.find((e) => e.id === booking.event_id)?.name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{booking.guest_count || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Booking Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <BarChart className="h-5 w-5 text-primary-600 mr-2" />
              Booking Status
            </h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Confirmed</span>
                  <span className="text-sm text-gray-600">
                    {stats.confirmedBookings}/{stats.totalBookings}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-success-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        stats.totalBookings > 0 ? (stats.confirmedBookings / stats.totalBookings) * 100 : 0
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                  <span className="text-sm text-gray-600">
                    {stats.pendingBookings}/{stats.totalBookings}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-warning-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        stats.totalBookings > 0 ? (stats.pendingBookings / stats.totalBookings) * 100 : 0
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Cancelled</span>
                  <span className="text-sm text-gray-600">
                    {stats.cancelledBookings}/{stats.totalBookings}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-error-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        stats.totalBookings > 0 ? (stats.cancelledBookings / stats.totalBookings) * 100 : 0
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <motion.div
                className="p-4 bg-success-100 rounded-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <CheckCircle className="h-6 w-6 text-success-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-success-700">Confirmed</p>
                <p className="text-lg font-bold text-success-800">{stats.confirmedBookings}</p>
              </motion.div>
              <motion.div
                className="p-4 bg-warning-100 rounded-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AlertCircle className="h-6 w-6 text-warning-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-warning-700">Pending</p>
                <p className="text-lg font-bold text-warning-800">{stats.pendingBookings}</p>
              </motion.div>
              <motion.div
                className="p-4 bg-error-100 rounded-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <XCircle className="h-6 w-6 text-error-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-error-700">Cancelled</p>
                <p className="text-lg font-bold text-error-800">{stats.cancelledBookings}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <a
            href="/admin/bookings"
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-md flex items-center justify-between hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Manage Bookings</h3>
              <p className="text-sm text-gray-500">View and update all bookings</p>
            </div>
            <Calendar className="h-10 w-10 text-primary-600" />
          </a>
          <a
            href="/admin/venues"
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-md flex items-center justify-between hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Manage Venues</h3>
              <p className="text-sm text-gray-500">Update venue details</p>
            </div>
            <MapPin className="h-10 w-10 text-primary-600" />
          </a>
          <a
            href="/admin/packages"
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-md flex items-center justify-between hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Manage Packages</h3>
              <p className="text-sm text-gray-500">Update package pricing</p>
            </div>
            <Package className="h-10 w-10 text-primary-600" />
          </a>
          <a
            href="/admin/users"
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-md flex items-center justify-between hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Manage Users</h3>
              <p className="text-sm text-gray-500">View customer accounts</p>
            </div>
            <Users className="h-10 w-10 text-primary-600" />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
