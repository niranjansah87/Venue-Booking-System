const express = require('express');
const router = express.Router();
const welcomeController = require('../controllers/welcomeController'); // Corrected import

// Booking Steps

// Step 1: Event, Venue, Shift Selection
router.get('/step1', welcomeController.step1);
router.post('/step1', welcomeController.step1Post);

// Step 2: Package + Menu Selection
router.get('/step2', welcomeController.step2);
router.post('/step2', welcomeController.step2Post);

// Step 3: Guest Info + OTP
router.get('/step3', welcomeController.step3);
router.post('/send-otp', welcomeController.sendOTP); // AJAX email verification
router.post('/step3', welcomeController.step3Post);

// Step 4: Final Confirmation
router.get('/step4', welcomeController.step4);
router.post('/store', welcomeController.storeBooking);

module.exports = router;
