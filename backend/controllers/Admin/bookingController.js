const { Booking, Event, Venue, Shift, Package, Menu, User } = require('../../models');
const { body, validationResult } = require('express-validator');
const sendEmail = require('../../utils/sendEmail');

// Initialize booking session
exports.initiateBooking = async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const events = await Event.findAll();
    const venues = await Venue.findAll();
    const shifts = await Shift.findAll();
    req.session.bookingData = req.session.bookingData || {};
    res.json({ sessionId, events, venues, shifts });
  } catch (error) {
    console.error('Error initiating booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




// Get booking by ID

exports.getBookingsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params; // Get the user_id from the URL parameter
    console.log('Fetching bookings for user ID:', user_id);  // Debugging: log the user ID

    // Check if the user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      console.error('User not found with ID:', user_id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Attempt to fetch all bookings for the specified user
    const bookings = await Booking.findAll({
      where: { user_id }, // Fetch bookings where the user_id matches the parameter
      include: [
        { model: Event, as: 'event', required: false },
        { model: Venue, as: 'venue', required: false },
        { model: Shift, as: 'shift', required: false },
        { model: Package, as: 'package', required: false }
      ]
    });

    // If no bookings are found for the user
    if (!bookings || bookings.length === 0) {
      console.error('No bookings found for user ID:', user_id);
      return res.status(404).json({ message: 'No bookings found for this user' });
    }

    // Log bookings data for debugging
    console.log('User bookings data:', bookings);

    // Send the bookings data as a JSON response
    res.json(bookings);
  } catch (error) {
    // Log any error encountered during the process
    console.error('Error fetching bookings by user ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




// Check date availability
exports.checkDate = [
  body('event_date').isDate().withMessage('Invalid date'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { event_date } = req.body;
    try {
      const bookings = await Booking.count({ where: { event_date } });
      const available = bookings < 10; // Limit to 10 bookings per date
      res.json({ available });
    } catch (error) {
      console.error('Error checking date:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
];

// Check booking availability
exports.checkBookingAvailability = [
  body('event_id').notEmpty().withMessage('Event is required'),
  body('venue_id').notEmpty().withMessage('Venue is required'),
  body('shift_id').notEmpty().withMessage('Shift is required'),
  body('event_date').isDate().withMessage('Event date is required'),
  body('guest_count').isInt({ min: 1 }).withMessage('Guest count must be a number'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { event_id, venue_id, shift_id, event_date, guest_count } = req.body;

    try {
      const venue = await Venue.findByPk(venue_id);
      if (!venue || venue.capacity < guest_count) {
        return res.status(400).json({ error: 'Venue capacity exceeded or invalid venue' });
      }
      const existingBooking = await Booking.findOne({
        where: { event_date, venue_id, shift_id },
      });
      if (existingBooking) {
        return res.status(400).json({ error: 'Venue is already booked for this date and shift' });
      }
      req.session.bookingData = {
        ...req.session.bookingData,
        event_id,
        venue_id,
        shift_id,
        event_date,
        guest_count,
      };
      res.json({ message: 'Slot is available' });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
];

// Fetch packages
exports.selectPackage = async (req, res) => {

  try {
    const packages = await Package.findAll({
      attributes: ['id', 'name', 'base_price'],
    });
    res.json({ packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get menus for a package
exports.getPackageMenus = async (req, res) => {
  const { packageId } = req.params;

  try {
    const menus = await Menu.findAll({
      where: { package_id: packageId },
      attributes: ['id', 'name', 'items', 'free_limit'],
    });
    res.json(
      menus.map((menu) => ({
        id: menu.id,
        name: menu.name,
        free_limit: menu.free_limit,
        items: menu.items.map((item, index) => ({
          name: item,
          index,
        })),
      }))
    );
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Calculate fare
exports.calculateFare = [
  body('package_id').isInt().withMessage('Invalid package ID'),
  body('guest_count').isInt({ min: 10 }).withMessage('Invalid guest count'),
  body('selected_menus').isObject().withMessage('Invalid menu selections'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { package_id, guest_count, selected_menus } = req.body;

    try {
      const pkg = await Package.findByPk(package_id);
      if (!pkg) {
        return res.status(404).json({ error: 'Package not found' });
      }
      let extra_charges = 0;
      for (const [menuId, itemIndexes] of Object.entries(selected_menus)) {
        const menu = await Menu.findByPk(menuId);
        if (!menu) continue;
        const free_limit = menu.free_limit || 0;
        if (itemIndexes.length > free_limit) {
          extra_charges += (itemIndexes.length - free_limit) * 100 * guest_count; // $100 per extra item per guest
        }
      }
      const base_fare = pkg.base_price * guest_count;
      const total_fare = base_fare + extra_charges;
      req.session.bookingData = {
        ...req.session.bookingData,
        package_id,
        guest_count,
        selected_menus,
        base_fare,
        extra_charges,
        total_fare,
      };
      res.json({ base_fare, extra_charges, total_fare });
    } catch (error) {
      console.error('Error calculating fare:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
];

// Store booking
exports.storeBooking = [
  body('user_id').isInt().withMessage('Valid user ID is required'),
  body('event_date').isDate().withMessage('Invalid event date'),
  body('event_id').isInt().withMessage('Invalid event ID'),
  body('guest_count').isInt({ min: 1 }).withMessage('Guest count must be a number'),
  body('venue_id').isInt().withMessage('Invalid venue ID'),
  body('shift_id').isInt().withMessage('Invalid shift ID'),
  body('package_id').isInt().withMessage('Invalid package ID'),
  body('selected_menus').isObject().withMessage('Invalid menu selections'),
  body('base_fare').isFloat({ min: 0 }).withMessage('Invalid base fare'),
  body('extra_charges').isFloat({ min: 0 }).withMessage('Invalid extra charges'),
  body('total_fare').isFloat({ min: 0 }).withMessage('Invalid total fare'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      user_id,
      event_date,
      event_id,
      guest_count,
      venue_id,
      shift_id,
      package_id,
      selected_menus,
      base_fare,
      extra_charges,
      total_fare,
      
    } = req.body;

    try {
      const [user, event, venue, shift, pkg] = await Promise.all([
        User.findByPk(user_id),
        Event.findByPk(event_id),
        Venue.findByPk(venue_id),
        Shift.findByPk(shift_id),
        Package.findByPk(package_id),
      ]);
      if (!user) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      if (!event || !venue || !shift || !pkg) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
      if (venue.capacity < guest_count) {
        return res.status(400).json({ error: 'Venue capacity exceeded' });
      }
      const existingBooking = await Booking.findOne({
        where: { event_date, venue_id, shift_id },
      });
      if (existingBooking) {
        return res.status(400).json({ error: 'Venue is already booked for this date and shift' });
      }
      const booking = await Booking.create({
        user_id,
        event_date,
        event_id,
        guest_count,
        venue_id,
        shift_id,
        package_id,
        selected_menus,
        base_fare,
        extra_charges,
        total_fare,
        status: 'pending',
      });
      req.session.bookingData = null; // Clear session
      res.json({ bookingId: booking.id });
    } catch (error) {
      console.error('Error storing booking:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
];

// Send confirmation email
exports.sendConfirmation = async (req, res) => {
  const { bookingId, email } = req.body;
  try {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Event, as: 'event' },      // Use alias 'event' here
        { model: Venue, as: 'venue' },      // Use alias 'venue' here
        { model: Shift, as: 'shift' },      // Use alias 'shift' here
        { model: Package, as: 'package' },  // Use alias 'package' here
        { model: User, as: 'user' }         // Use alias 'user' here
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // console.log(booking);
        const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            h1 {
              text-align: center;
              color: #4CAF50;
              font-size: 32px;
              margin-bottom: 20px;
            }
            .content {
              font-size: 16px;
              line-height: 1.6;
              color: #555;
            }
            .content p {
              margin: 10px 0;
            }
            .highlight {
              color: #4CAF50;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 14px;
              color: #999;
              margin-top: 30px;
            }
            .footer a {
              color: #4CAF50;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Booking Confirmation</h1>
            <div class="content">
              <p>Dear <span class="highlight">${booking.user?.dataValues?.name || 'Customer'}</span>,</p>
              <p>Your booking has been successfully submitted. Below are the details:</p>

              <p><strong>Booking ID:</strong> <span class="highlight">${booking.id}</span></p>
              <p><strong>Event:</strong> <span class="highlight">${booking.event?.dataValues?.name || 'N/A'}</span></p>
              <p><strong>Date:</strong> <span class="highlight">${booking.event_date}</span></p>
              <p><strong>Venue:</strong> <span class="highlight">${booking.venue?.dataValues?.name || 'N/A'}</span></p>
              <p><strong>Shift:</strong> <span class="highlight">${booking.shift?.dataValues?.name || 'N/A'}</span></p>
              <p><strong>Guests:</strong> <span class="highlight">${booking.guest_count}</span></p>
              <p><strong>Package:</strong> <span class="highlight">${booking.package?.dataValues?.name || 'N/A'}</span></p>
              <p><strong>Total Fare:</strong> <span class="highlight">$${booking.total_fare}</span></p>

              <p>We'll contact you soon to confirm availability. If you have any questions, feel free to reach out to us.</p>
            </div>

            <div class="footer">
              <p>Thank you for choosing us!</p>
              <p>Need help? <a href="mailto:support@example.com">Contact Support</a></p>
            </div>
          </div>
        </body>
      </html>
    `;


    await sendEmail({
      to: email,
      subject: 'Booking Confirmation',
      html,
    });
    res.json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Error sending confirmation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Get venue details
exports.getVenueDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findByPk(id);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(venue);
  } catch (error) {
    console.error('Error fetching venue details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get shift details
exports.getShiftDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findByPk(id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    res.json(shift);
  } catch (error) {
    console.error('Error fetching shift details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get package details
exports.getPackageDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(pkg);
  } catch (error) {
    console.error('Error fetching package details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// List all bookings





exports.listBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Event, as: 'event' },  // Use the alias 'event' here
        { model: Venue, as: 'venue' },  // Use the alias 'venue' here
        { model: Shift, as: 'shift' },  // Use the alias 'shift' here
        { model: Package, as: 'package' },  // Use the alias 'package' here
        { model: User, as: 'user' }  // Use the alias 'user' here
      ],
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Update booking status
exports.updateBookingStatus = [
  body('status').notEmpty().withMessage('Status is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { bookingId } = req.params;
      const { status } = req.body;
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      booking.status = status;
      await booking.save();
      res.json({ message: 'Booking status updated', booking });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
];

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    await booking.destroy();
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};