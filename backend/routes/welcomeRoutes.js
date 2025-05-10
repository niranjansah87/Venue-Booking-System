const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const welcomeController = require('../controllers/welcomeController');

// Booking Flow Routes (User-Facing)
router.get('/step1', welcomeController.step1);
router.post(
  '/step1',
  [
    body('event_id').notEmpty().withMessage('Event is required'),
    body('venue_id').notEmpty().withMessage('Venue is required'),
    body('shift_id').notEmpty().withMessage('Shift is required'),
    body('event_date').notEmpty().withMessage('Event date is required'),
  ],
  welcomeController.step1Post
);

router.get('/step2', welcomeController.step2);
router.post(
  '/step2',
  [
    body('package_id').notEmpty().withMessage('Package is required'),
    body('selected_menus').notEmpty().withMessage('Menu selections are required'),
  ],
  welcomeController.step2Post
);

router.get('/step3', welcomeController.step3);
router.post(
  '/send-otp',
  [
    body('email').isEmail().withMessage('Invalid email'),
  ],
  welcomeController.sendOTP
);
router.post(
  '/step3',
  [
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  welcomeController.step3Post
);

router.get('/step4', welcomeController.step4);
router.post('/store', welcomeController.storeBooking);

module.exports = router;
