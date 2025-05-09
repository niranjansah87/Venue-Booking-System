const Event = require('../../models/event');
const Venue = require('../../models/venue');
const Shift = require('../../models/shift');
const Package = require('../../models/package');
const Menu = require('../../models/menu');
const Booking = require('../../models/booking');
const User = require('../../models/users');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const bookingController = {
  // List all bookings (Admin Dashboard)
  index: async (req, res) => {
    try {
      const bookings = await Booking.find()
        .populate('event_id venue_id shift_id package_id user_id')
        .sort({ event_date: -1 });

      res.render('admin/bookings/index', { bookings });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  },

  // Render form to edit a booking
  edit: async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('event_id venue_id shift_id package_id user_id');

      const events = await Event.find();
      const venues = await Venue.find();
      const shifts = await Shift.find();
      const packages = await Package.find();

      if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/admin/bookings');
      }

      res.render('admin/bookings/edit', {
        booking,
        events,
        venues,
        shifts,
        packages
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  },

  // Update booking data
  update: async (req, res) => {
    try {
      const {
        event_id,
        venue_id,
        shift_id,
        package_id,
        guest_count,
        event_date,
        status
      } = req.body;

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        {
          event_id,
          venue_id,
          shift_id,
          package_id,
          guest_count,
          event_date,
          status
        },
        { new: true }
      );

      if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/admin/bookings');
      }

      req.flash('success', 'Booking updated successfully');
      res.redirect('/admin/bookings');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Update failed');
      res.redirect('/admin/bookings');
    }
  },

  // Delete a booking
  destroy: async (req, res) => {
    try {
      const deleted = await Booking.findByIdAndDelete(req.params.id);
      if (!deleted) {
        req.flash('error', 'Booking not found');
        return res.redirect('/admin/bookings');
      }
      req.flash('success', 'Booking deleted');
      res.redirect('/admin/bookings');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  },

  // Multi-step booking (existing code retained below) ...
  create: async (req, res) => {
    const events = await Event.find();
    const venues = await Venue.find();
    const shifts = await Shift.find();
    res.render('admin/bookings/create', {
      events,
      venues,
      shifts,
      old: req.session.old || {}
    });
  },

  checkAvailability: async (req, res) => {
    const action = req.body.action || 'check';
    const data = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(e => e.msg).join(', '));
      return res.redirect('/admin/bookings/create');
    }

    if (action === 'proceed') {
      const currentData = { ...data };
      delete currentData._csrf;
      delete currentData.action;

      const storedData = req.session.booking?.originalStep1 || {};
      const changed = Object.keys(currentData).some(
        key => currentData[key] !== storedData[key]
      );

      if (changed) {
        req.flash('error', 'Form data has changed. Please recheck availability.');
        return res.redirect('/admin/bookings/create');
      }

      return res.redirect('/admin/bookings/select-package');
    }

    const { event_id, venue_id, shift_id, event_date, guest_count } = data;
    const venue = await Venue.findById(venue_id);
    if (!venue) {
      req.flash('error', 'Invalid venue selected.');
      return res.redirect('/admin/bookings/create');
    }

    if (guest_count > venue.capacity) {
      req.flash('error', `Guest count exceeds venue capacity of ${venue.capacity}`);
      return res.redirect('/admin/bookings/create');
    }

    const conflict = await Booking.findOne({
      event_date,
      venue_id,
      shift_id,
      status: 'confirmed'
    });

    if (!conflict) {
      req.session.booking = {
        step1: data,
        originalStep1: { ...data }
      };
      req.flash('success', 'Booking available! Use the "Proceed" button to continue.');
      return res.redirect('/admin/bookings/create');
    }

    req.flash('error', 'Selected slot is not available.');
    return res.redirect('/admin/bookings/create');
  },

  selectPackage: async (req, res) => {
    const { step1, originalStep1 } = req.session.booking || {};
    if (!step1 || !originalStep1 || JSON.stringify(step1) !== JSON.stringify(originalStep1)) {
      req.session.booking = null;
      req.flash('error', 'Data mismatch detected. Please restart booking process.');
      return res.redirect('/admin/bookings/create');
    }

    const packages = await Package.find().populate('menus');
    res.render('admin/bookings/select-package', { packages });
  },

  calculateFare: async (req, res) => {
    const { package_id, menus } = req.body;
    const packageData = await Package.findById(package_id).populate('menus');

    if (!packageData) {
      req.flash('error', 'Invalid package selected.');
      return res.redirect('/admin/bookings/select-package');
    }

    const step1 = req.session.booking.step1;
    const guestCount = parseInt(step1.guest_count);
    let extraFare = 0;

    if (menus) {
      for (const [menuId, indexes] of Object.entries(menus)) {
        const menu = packageData.menus.find(m => m._id.toString() === menuId);
        if (!menu) continue;

        const validIndexes = indexes.map(i => parseInt(i)).filter(i => i < menu.items.length);
        for (const index of validIndexes) {
          if (index >= menu.free_limit) {
            extraFare += menu.items[index]?.price || 0;
          }
        }
      }
    }

    const totalFare = (packageData.base_price + extraFare) * guestCount;

    req.session.booking.step2 = {
      package_id: packageData._id,
      menus,
      total_fare: totalFare
    };

    res.redirect('/admin/bookings/user-info');
  },

  userInfo: async (req, res) => {
    const { step1, step2 } = req.session.booking || {};
    if (!step1 || !step2) {
      req.flash('error', 'Session expired. Please start over.');
      return res.redirect('/admin/bookings/create');
    }

    const event = await Event.findById(step1.event_id);
    const shift = await Shift.findById(step1.shift_id);
    const venue = await Venue.findById(step1.venue_id);
    const pkg = await Package.findById(step2.package_id);

    res.render('admin/bookings/user-info', {
      event_date: step1.event_date,
      event,
      shift,
      venue,
      menus: step2.menus,
      package: pkg,
      guest_count: step1.guest_count,
      total_fare: step2.total_fare,
      old: req.session.booking.step3 || {}
    });
  },

  store: async (req, res) => {
    try {
      const { name, phone } = req.body;
      const { step1, step2 } = req.session.booking;

      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        req.flash('error', 'Phone number already exists.');
        return res.redirect('/admin/bookings/user-info');
      }

      const user = await User.create({
        name,
        phone,
        password: await bcrypt.hash('password', 10)
      });

      await Booking.create({
        user_id: user._id,
        event_id: step1.event_id,
        venue_id: step1.venue_id,
        shift_id: step1.shift_id,
        package_id: step2.package_id,
        event_date: step1.event_date,
        guest_count: step1.guest_count,
        selected_menus: step2.menus,
        total_fare: step2.total_fare,
        status: 'pending'
      });

      req.session.booking = null;
      req.flash('success', 'Booking created successfully!');
      return res.redirect('/admin/bookings/create');
    } catch (e) {
      req.flash('error', 'Booking failed: ' + e.message);
      return res.redirect('/admin/bookings/user-info');
    }
  },

  getPackageMenus: async (req, res) => {
    try {
      const packageData = await Package.findById(req.params.packageId).populate('menus');
      const menus = packageData.menus.map(menu => ({
        id: menu._id,
        name: menu.name,
        items: menu.items,
        free_limit: menu.free_limit
      }));
      res.json(menus);
    } catch (e) {
      res.status(500).json({ error: 'Unable to fetch menus' });
    }
  }
};

module.exports = bookingController;
