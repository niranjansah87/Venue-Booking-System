const bcrypt = require('bcryptjs');
const { User, Event, Venue, Booking, Shift,Otp } = require('../models');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'User',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      attributes: ['id', 'name'],
    });
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

exports.getVenues = async (req, res) => {
  try {
    const venues = await Venue.findAll({
      attributes: ['id', 'name'],
    });
    res.json({ venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Failed to fetch venues' });
  }
};

exports.checkAvailability = async (req, res) => {
  const { venueId, event_date, guestCount, shiftId } = req.body;

  try {
    if (!venueId || !event_date || !guestCount || !shiftId) {
      return res.status(400).json({ message: 'Please provide venue, event date, guest count, and shift' });
    }

    // Validate venue exists
    const venue = await Venue.findByPk(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Validate shift exists
    const shift = await Shift.findByPk(shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        venueId,
        event_date,
        shiftId,
      },
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Venue is not available for this date and shift' });
    }

    res.json({ available: true });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Failed to check availability' });
  }
};



exports.sendOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Store OTP in database
    await Otp.create({
      user_id: user.id,
      otp_code: otp,
      expires_at: expiresAt,
    });

    // Send OTP via email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a202c;">Your OTP Code</h2>
        <p style="color: #4a5568;">Hello ${user.name || 'User'},</p>
        <p style="color: #4a5568;">
          Your One-Time Password (OTP) for A One Cafe booking verification is:
        </p>
        <h3 style="color: #2b6cb0; font-size: 24px; margin: 20px 0;">${otp}</h3>
        <p style="color: #4a5568;">
          This OTP is valid for 5 minutes. Please do not share it with anyone.
        </p>
        <p style="color: #4a5568;">Thank you,<br />A One Cafe Team</p>
      </div>
    `;

    const emailSent = await sendEmail({
      to: email,
      subject: 'Your A One Cafe OTP Code',
      html,
    });

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    console.log(`OTP for ${email}: ${otp}`); // Keep for debugging
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

exports.step1 = async (req, res) => {
  try {
    const events = await Event.findAll({ attributes: ['id', 'name'] });
    const venues = await Venue.findAll({ attributes: ['id', 'name'] });
    const shifts = await Shift.findAll({ attributes: ['id', 'name'] });
    res.json({ events, venues, shifts });
  } catch (error) {
    console.error('Error fetching step1 data:', error);
    res.status(500).json({ message: 'Failed to fetch step1 data' });
  }
};

exports.step1Post = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { event_id, venue_id, shift_id, event_date, guest_count } = req.body;

  try {
    // Validate existence
    const event = await Event.findByPk(event_id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const venue = await Venue.findByPk(venue_id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });

    const shift = await Shift.findByPk(shift_id);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    // Check availability
    const conflictingBooking = await Booking.findOne({
      where: { venue_id, event_date, shift_id },
    });
    if (conflictingBooking) {
      return res.status(400).json({ message: 'Venue is not available for this date and shift' });
    }

    res.json({ message: 'Step 1 validated successfully' });
  } catch (error) {
    console.error('Error in step1Post:', error);
    res.status(500).json({ message: 'Failed to process step1' });
  }
};

exports.step2 = async (req, res) => {
  // Placeholder: Fetch packages and menus
  try {
    const packages = await Package.findAll({ attributes: ['id', 'name'] }); // Adjust model as needed
    const menus = await Menu.findAll({ attributes: ['id', 'name'] }); // Adjust model as needed
    res.json({ packages, menus });
  } catch (error) {
    console.error('Error fetching step2 data:', error);
    res.status(500).json({ message: 'Failed to fetch step2 data' });
  }
};

exports.step2Post = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { package_id, selected_menus } = req.body;

  try {
    // Validate package and menus
    const packageItem = await Package.findByPk(package_id); // Adjust model
    if (!packageItem) return res.status(404).json({ message: 'Package not found' });

    // Validate menus (adjust as needed)
    if (!Array.isArray(selected_menus) || selected_menus.length === 0) {
      return res.status(400).json({ message: 'Invalid menu selections' });
    }

    res.json({ message: 'Step 2 validated successfully' });
  } catch (error) {
    console.error('Error in step2Post:', error);
    res.status(500).json({ message: 'Failed to process step2' });
  }
};

exports.step3 = async (req, res) => {
  res.json({ message: 'Step 3: OTP verification' }); // Placeholder
};

exports.step3Post = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { userId, otp, name } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user || user.name !== name) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simulate OTP verification
    const isValidOtp = otp === '123456'; // Placeholder
    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error in step3Post:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

exports.step4 = async (req, res) => {
  res.json({ message: 'Step 4: Final confirmation' }); // Placeholder
};

exports.storeBooking = async (req, res) => {
  const { userId, event_id, venue_id, shift_id, event_date, guest_count, package_id, selected_menus } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const booking = await Booking.create({
      userId,
      eventId: event_id,
      venueId: venue_id,
      shiftId: shift_id,
      event_date,
      guestCount: guest_count,
      packageId: package_id,
      selectedMenus: selected_menus,
    });

    res.json({ message: 'Booking created successfully', bookingId: booking.id });
  } catch (error) {
    console.error('Error storing booking:', error);
    res.status(500).json({ message: 'Failed to store booking' });
  }
};

exports.calculateFare = async (req, res) => {
  const { package_id, guest_count } = req.body;

  try {
    // Placeholder fare calculation
    const packageItem = await Package.findByPk(package_id); // Adjust model
    if (!packageItem) return res.status(404).json({ message: 'Package not found' });

    const fare = packageItem.price * guest_count; // Adjust logic
    res.json({ fare });
  } catch (error) {
    console.error('Error calculating fare:', error);
    res.status(500).json({ message: 'Failed to calculate fare' });
  }
};

exports.sendConfirmation = async (req, res) => {
  const { bookingId, email } = req.body;

  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Simulate email sending
    console.log(`Confirmation email sent to ${email} for booking ${bookingId}`);
    res.json({ message: 'Confirmation email sent successfully' });
  } catch (error) {
    console.error('Error sending confirmation:', error);
    res.status(500).json({ message: 'Failed to send confirmation email' });
  }
};




exports.verifyOTP = async (req, res) => {
  
  

  const { otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({
      where: {
        otp_code: otp,
        expires_at: { [Op.gt]: new Date() }, // Not expired
      },
      include: [{ model: User }],
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Optional: Delete OTP after verification
    await otpRecord.destroy();

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};