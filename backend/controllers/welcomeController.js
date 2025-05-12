const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking'); // Adjust path as needed
const sendEmail = require('../utils/email'); // Adjust path as needed
const { storeOTP, verifyOTP, clearOTP } = require('../utils/otpStore');

// Step 1: Select Event, Venue, Shift, Date, Guests
exports.step1 = async (req, res) => {
  try {
    res.render('step1', { user: req.user });
  } catch (error) {
    console.error('Error in step1:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.step1Post = [
  body('event_id').notEmpty().withMessage('Event is required'),
  body('venue_id').notEmpty().withMessage('Venue is required'),
  body('shift_id').notEmpty().withMessage('Shift is required'),
  body('event_date').notEmpty().withMessage('Event date is required'),
  body('guest_count').isInt({ min: 10 }).withMessage('Guest count must be at least 10'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { event_id, venue_id, shift_id, event_date, guest_count } = req.body;
      req.session.booking = {
        event_id,
        venue_id,
        shift_id,
        event_date,
        guest_count,
      };
      res.redirect('/api/admin/book/step2');
    } catch (error) {
      console.error('Error in step1Post:', error);
      res.status(500).json({ message: 'Error saving booking information' });
    }
  },
];

// Step 2: Select Package & Menu
exports.step2 = async (req, res) => {
  try {
    res.render('step2', { user: req.user });
  } catch (error) {
    console.error('Error in step2:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.step2Post = [
  body('package_id').notEmpty().withMessage('Package is required'),
  body('selected_menus').notEmpty().withMessage('Menu selections are required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { package_id, selected_menus } = req.body;
      req.session.booking = {
        ...req.session.booking,
        package_id,
        selected_menus,
      };
      res.redirect('/api/admin/book/step3');
    } catch (error) {
      console.error('Error in step2Post:', error);
      res.status(500).json({ message: 'Error saving package information' });
    }
  },
];

// Step 3: Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid user ID and email are required.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    storeOTP(userId, otp);

    const success = await sendEmail({
      to: email,
      subject: 'Venue Booking OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 30px; max-width: 500px; margin: auto; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; text-align: center;">Verify Your Booking</h2>
          <p style="font-size: 16px; color: #333;">
            Thank you for choosing our venue! To proceed with your booking, please enter the following One-Time Password (OTP):
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; background-color: #4CAF50; color: #fff; padding: 14px 28px; font-size: 24px; border-radius: 8px; letter-spacing: 4px;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #666;">
            This OTP is valid for the next 10 minutes. If you did not request this, please ignore this message.
          </p>
          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">
            © ${new Date().getFullYear()} Venue Booking System
          </p>
        </div>
      `,
    });

    if (success) {
      res.json({ sent: true });
    } else {
      res.status(500).json({ message: 'Failed to send OTP.' });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
};

// Step 3: Verify OTP & Guest Info
exports.step3 = async (req, res) => {
  try {
    res.render('step3', { user: req.user });
  } catch (error) {
    console.error('Error in step3:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.step3Post = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('name').notEmpty().withMessage('Name is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, otp, name } = req.body;

    if (!verifyOTP(userId, otp)) {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }

    try {
      req.session.booking = {
        ...req.session.booking,
        name,
        email: req.body.email || req.session.booking.email,
      };
      clearOTP(userId);
      res.redirect('/api/admin/book/step4');
    } catch (error) {
      console.error('Error in step3Post:', error);
      res.status(500).json({ message: 'Error saving guest information.' });
    }
  },
];

// Step 4: Booking Summary
exports.step4 = async (req, res) => {
  try {
    res.render('step4', { user: req.user, booking: req.session.booking });
  } catch (error) {
    console.error('Error in step4:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Store Booking
exports.storeBooking = async (req, res) => {
  const { userId, event_id, venue_id, shift_id, package_id, event_date, guest_count, selected_menus, total_fare, name, email } = req.body;

  if (!userId || !event_id || !venue_id || !shift_id || !package_id || !event_date || !guest_count || !selected_menus || !total_fare) {
    return res.status(400).json({ message: 'Missing required booking details.' });
  }

  try {
    const savedBooking = await Booking.create({
      user_id: userId,
      event_id,
      venue_id,
      shift_id,
      package_id,
      event_date,
      guest_count,
      selected_menus,
      total_fare,
      status: 'pending',
    });

    const success = await sendEmail({
      to: email,
      subject: 'Booking Confirmation - Elegance Venues',
      html: `
        <h2>Booking Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your booking with Elegance Venues! Your booking has been successfully confirmed.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${savedBooking.id}</li>
          <li><strong>Date:</strong> ${event_date}</li>
          <li><strong>Venue ID:</strong> ${venue_id}</li>
          <li><strong>Total Fare:</strong> $${total_fare}</li>
        </ul>
        <p>We look forward to hosting your event. If you have any questions, please contact us.</p>
        <p>Best regards,<br>Elegance Venues Team</p>
      `,
    });

    if (!success) {
      console.warn('Confirmation email failed to send, but booking was saved.');
    }

    delete req.session.booking;

    res.json({ bookingId: savedBooking.id, message: 'Booking confirmed successfully.' });
  } catch (error) {
    console.error('Error storing booking:', error);
    res.status(500).json({ message: 'Failed to store booking.' });
  }
};

// Check Availability
exports.checkAvailability = async (req, res) => {
  const { userId, event_id, venue_id, shift_id, event_date, guest_count } = req.body;
  if (!userId || !event_id || !venue_id || !shift_id || !event_date || !guest_count) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    // Placeholder: Implement availability check logic (e.g., query database)
    res.json({ available: true });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Failed to check availability.' });
  }
};

// Calculate Fare
exports.calculateFare = async (req, res) => {
  const { userId, package_id, selected_menus, guest_count } = req.body;
  if (!userId || !package_id || !guest_count) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    // Placeholder: Implement fare calculation logic
    const base_fare = 1000; // Example
    const extra_charges = 200; // Example
    const total_fare = base_fare + extra_charges;
    res.json({ base_fare, extra_charges, total_fare });
  } catch (error) {
    console.error('Error calculating fare:', error);
    res.status(500).json({ message: 'Failed to calculate fare.' });
  }
};

// Send Confirmation Email
exports.sendConfirmation = async (req, res) => {
  const { bookingId, email } = req.body;
  if (!bookingId || !email) {
    return res.status(400).json({ message: 'Booking ID and email are required.' });
  }
  try {
    // Placeholder: Fetch booking details if needed
    const success = await sendEmail({
      to: email,
      subject: 'Booking Confirmation - Elegance Venues',
      html: `
        <h2>Booking Confirmation</h2>
        <p>Thank you for your booking!</p>
        <p>Booking ID: ${bookingId}</p>
      `,
    });
    if (success) {
      res.json({ message: 'Confirmation email sent.' });
    } else {
      res.status(500).json({ message: 'Failed to send confirmation email.' });
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({ message: 'Failed to send confirmation email.' });
  }
};