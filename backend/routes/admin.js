const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import Controllers
const AuthController = require('../controllers/Admin/adminAuthController');
const eventController = require('../controllers/Admin/eventController');
const venueController = require('../controllers/Admin/venueController');
const AdminProfileController = require('../controllers/Admin/adminProfileController');
const bookingController = require('../controllers/Admin/bookingController');

// Authentication Routes
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Admin Profile Routes
router.post('/update', AdminProfileController.updateProfile);

// Event Routes
router.get('/events', eventController.index);
router.post('/events/create', eventController.store);
router.put('/events/edit/:id', eventController.update);
router.delete('/events/delete/:id', eventController.destroy);

// Venue Routes
router.get('/venues', venueController.getAllVenues);
router.post('/venues/create', venueController.createVenue);
router.put('/venues/update/:id', venueController.updateVenue);
router.delete('/venues/delete/:id', venueController.deleteVenue);

// Booking Flow Routes (multi-step booking)
router.get('/bookings/create', bookingController.create);
router.post(
  '/bookings/check-availability',
  [
    body('event_id').notEmpty().withMessage('Event is required'),
    body('venue_id').notEmpty().withMessage('Venue is required'),
    body('shift_id').notEmpty().withMessage('Shift is required'),
    body('event_date').notEmpty().withMessage('Event date is required'),
    body('guest_count').isInt({ min: 1 }).withMessage('Guest count must be a number')
  ],
  bookingController.checkAvailability
);
router.get('/bookings/select-package', bookingController.selectPackage);
router.post('/bookings/calculate-fare', bookingController.calculateFare);
router.get('/bookings/user-info', bookingController.userInfo);
router.post('/bookings/store', bookingController.store);
router.get('/bookings/menus/:packageId', bookingController.getPackageMenus);
// Admin CRUD for managing bookings
router.get('/bookings', bookingController.index); // List all bookings
router.get('/bookings/edit/:id', bookingController.edit); // Show booking edit form
router.put('/bookings/update/:id', bookingController.update); // Update booking
router.delete('/bookings/delete/:id', bookingController.destroy); // Delete booking


module.exports = router;