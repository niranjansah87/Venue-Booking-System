const express = require('express');
const router = express.Router();

// Import Controllers
const AuthController = require('../controllers/Admin/adminAuthController');
const dashboardController = require('../controllers/Admin/DashboardController');
const eventController = require('../controllers/Admin/eventController');
const VenueController = require('../controllers/Admin/venueController');
const ShiftController = require('../controllers/Admin/shiftController');
const BookingController = require('../controllers/Admin/bookingController');
const PackageController = require('../controllers/Admin/packageController');
const MenuController = require('../controllers/Admin/menuController');
const UserController = require('../controllers/Admin/userController');
const AdminProfileController = require('../controllers/Admin/adminProfileController');

// Authentication Routes
// router.get('/signup', AuthController.signup); 
// router.post('/login', AuthController.login);
// router.post('/logout', AuthController.logout);

// Admin Routes (Requires Authentication Middleware)
// router.use('/dashboard', AuthController.authMiddleware, DashboardController.index);

// CRUD Routes for Admin Resources (Requires Authentication Middleware)
// Event Routes
router.get('/events', eventController.index);            // Display all events
router.post('/events/create', eventController.store);    // Show create form
router.put('/events/edit/:id', eventController.update);    // Show edit form
router.delete('/events/delete/:id', eventController.destroy); // Update event


// router.use('/venues', VenueController);
// router.use('/shifts', ShiftController);
// router.use('/packages',  PackageController);
// router.use('/menus',  MenuController);
// router.use('/users', UserController);

// // Booking Routes
// router.get('/bookings', BookingController.index); // View all bookings
// router.post('/bookings/store', BookingController.store);
// router.put('/bookings/update/:id', BookingController.update);
// router.delete('/bookings/delete/:id', BookingController.delete);

// // Booking Specific Routes
// router.get('/bookings/create', BookingController.create);
// router.post('/bookings/check-availability', BookingController.checkAvailability);
// router.get('/bookings/select-package', BookingController.selectPackage);
// router.post('/bookings/calculate-fare', BookingController.calculateFare);
// router.get('/bookings/user-info', BookingController.userInfo);

// // Admin Profile Routes
// router.get('/profile', AdminProfileController.edit);
// router.put('/profile', AdminProfileController.update);

module.exports = router;
