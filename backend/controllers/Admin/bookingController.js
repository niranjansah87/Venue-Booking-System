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

// Get bookings by user ID
exports.getBookingsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log('Fetching bookings for user ID:', user_id);

    const user = await User.findByPk(user_id);
    if (!user) {
      console.error('User not found with ID:', user_id);
      return res.status(404).json({ message: 'User not found' });
    }

    const bookings = await Booking.findAll({
      where: { user_id },
      include: [
        { model: Event, as: 'event', required: false },
        { model: Venue, as: 'venue', required: false },
        { model: Shift, as: 'shift', required: false },
        { model: Package, as: 'package', required: false }
      ]
    });

    if (!bookings || bookings.length === 0) {
      console.error('No bookings found for user ID:', user_id);
      return res.status(404).json({ message: 'No bookings found for this user' });
    }

    console.log('User bookings data:', bookings);
    res.json(bookings);
  } catch (error) {
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
      const available = bookings < 10;
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
          name: item.name,
          price: item.price,
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
          const extraItems = itemIndexes.slice(free_limit);
          for (const index of extraItems) {
            const item = menu.items[index];
            if (item && item.price != null) {
              extra_charges += item.price * guest_count;
            } else {
              extra_charges += 10 * guest_count; // Default price
            }
          }
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
  body('customer_phone').isMobilePhone('any').withMessage('Invalid phone number'),

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
      customer_phone
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
      // Format phone number with +977 prefix if not already present
      const formattedPhone = customer_phone.startsWith('+977') ? customer_phone : `+977${customer_phone.replace(/^\+?977/, '')}`;
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
        customer_phone: formattedPhone,
        status: 'pending',
      });
      req.session.bookingData = null;
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
        { model: Event, as: 'event' },
        { model: Venue, as: 'venue' },
        { model: Shift, as: 'shift' },
        { model: Package, as: 'package' },
        { model: User, as: 'user' }
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Format phone number for display
    const displayPhone = booking.customer_phone || 'N/A';
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
              <p><strong>Phone:</strong> <span class="highlight">🇳🇵 ${displayPhone}</span></p>
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
        { model: Event, as: 'event' },
        { model: Venue, as: 'venue' },
        { model: Shift, as: 'shift' },
        { model: Package, as: 'package' },
        { model: User, as: 'user' }
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

// Menu-related endpoints
const db = require('../../models');
const Menu = db.Menu;
const Package = db.Package;

exports.displayMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      include: [{ model: Package, as: 'package' }]
    });
    res.json(menus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching menus' });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const { package_id, name, items, free_limit } = req.body;

    if (!package_id || !name || !Array.isArray(items) || typeof free_limit !== 'number') {
      return res.status(400).json({ error: 'All fields are required and must be valid' });
    }

    // Validate items format: [{ name: string, price: number }, ...]
    if (!items.every(item => typeof item === 'object' && item.name && typeof item.price === 'number')) {
      return res.status(400).json({ error: 'Items must be an array of objects with name and price' });
    }

    const pkg = await Package.findByPk(package_id);
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package_id. Package does not exist.' });
    }

    const newMenu = await Menu.create({
      package_id,
      name,
      items,
      free_limit
    });

    res.status(201).json({ message: 'Menu created successfully', menu: newMenu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating menu' });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { name, items, free_limit } = req.body;
    const { package_id, id: menu_id } = req.params;
    const updateFields = {};

    if (package_id) {
      const pkg = await Package.findByPk(package_id);
      if (!pkg) {
        return res.status(400).json({ error: 'Invalid package_id. Package does not exist.' });
      }
      updateFields.package_id = package_id;
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Invalid name' });
      }
      updateFields.name = name;
    }

    if (items !== undefined) {
      if (!Array.isArray(items) || !items.every(item => typeof item === 'object' && item.name && typeof item.price === 'number')) {
        return res.status(400).json({ error: 'Items must be an array of objects with name and price' });
      }
      updateFields.items = items;
    }

    if (free_limit !== undefined) {
      if (typeof free_limit !== 'number') {
        return res.status(400).json({ error: 'Free limit must be a number' });
      }
      updateFields.free_limit = free_limit;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'At least one valid field is required to update' });
    }

    const [updated] = await Menu.update(updateFields, {
      where: { id: menu_id },
    });

    if (!updated) {
      return res.status(404).json({ error: 'Menu not found or no changes applied' });
    }

    res.json({ message: 'Menu updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating menu' });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const deleted = await Menu.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    res.json({ message: 'Menu deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting menu' });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const menuId = req.params.id;

    const menu = await Menu.findByPk(menuId, {
      include: [{ model: Package, as: 'package' }]
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    res.json(menu);
  } catch (err) {
    console.error('Error fetching menu by ID:', err);
    res.status(500).json({ error: 'Error fetching menu' });
  }
};

exports.getMenuByPackageId = async (req, res) => {
  try {
    const packageId = req.params.package_id;

    const menus = await Menu.findAll({
      where: { package_id: packageId },
      include: [{ model: Package, as: 'package' }]
    });

    if (menus.length === 0) {
      return res.status(404).json({ error: 'No menus found for the specified package' });
    }

    res.json(menus);
  } catch (err) {
    console.error('Error fetching menus by package ID:', err);
    res.status(500).json({ error: 'Error fetching menus by package ID' });
  }
};