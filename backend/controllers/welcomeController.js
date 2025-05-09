const { Event, Venue, Shift, Package, Menu, Booking } = require('../models');
const { Op } = require('sequelize');
const sendEmail = require('../utils/sendEmail');

// Step 1: Show form
exports.step1 = async (req, res) => {
  try {
    const [events, venues, shifts] = await Promise.all([
      Event.findAll(),
      Venue.findAll(),
      Shift.findAll(),
    ]);
    res.render('book.step1', { events, venues, shifts });
  } catch (error) {
    console.error('Error in step1:', error);
    res.status(500).send('Internal server error');
  }
};

// Step 1: Handle submission
exports.step1Post = async (req, res) => {
  const { event_id, event_date, guest_count, venue_id, shift_id } = req.body;

  if (!event_id || !event_date || !guest_count || !venue_id || !shift_id) {
    return res.status(400).send('All fields are required.');
  }

  try {
    const isBooked = await Booking.findOne({
      where: { event_date, venue_id, shift_id, status: 'confirmed' }
    });

    if (isBooked) {
      return res.status(409).send('Selected slot is already booked.');
    }

    req.session.booking = {
      event_id,
      event_date,
      guest_count: parseInt(guest_count),
      venue_id,
      shift_id
    };

    res.redirect('/api/admin/book/step2');
  } catch (error) {
    console.error('Error in step1Post:', error);
    res.status(500).send('Failed to process booking.');
  }
};

// Step 2: Show packages
exports.step2 = async (req, res) => {
  try {
    const packages = await Package.findAll();
    res.render('book.step2', { packages });
  } catch (error) {
    console.error('Error in step2:', error);
    res.status(500).send('Unable to load packages.');
  }
};

// Step 2: Handle selection
exports.step2Post = (req, res) => {
  const { package_id, selected_menus } = req.body;

  if (!package_id || !selected_menus) {
    return res.status(400).send('Package and menu selection required.');
  }

  try {
    req.session.booking.package_id = package_id;
    req.session.booking.selected_menus = JSON.stringify(selected_menus);
    res.redirect('/api/admin/book/step3');
  } catch (error) {
    console.error('Error in step2Post:', error);
    res.status(500).send('Error saving menu selection.');
  }
};

// Step 3: Show guest form
exports.step3 = (req, res) => {
  res.render('book.step3');
};

// Step 3: Send OTP
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).send('Valid email is required.');
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
    req.session.verificationOTP = otp;
    req.session.booking.email = email;

    await sendEmail(email, 'Venue Booking OTP Verification', `Your OTP is: ${otp}`);
    res.json({ sent: true });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send('Failed to send OTP.');
  }
};

// Step 3: Verify OTP & Guest Info
exports.step3Post = (req, res) => {
  const { name, otp } = req.body;

  if (!name || !otp) {
    return res.status(400).send('Name and OTP required.');
  }

  if (parseInt(otp) !== req.session.verificationOTP) {
    return res.status(401).send('Invalid OTP.');
  }

  req.session.booking.name = name;
  delete req.session.verificationOTP;

  res.redirect('/api/admin/book/step4');
};

// Step 4: Show confirmation
exports.step4 = async (req, res) => {
  const { booking } = req.session;

  if (!booking) return res.redirect('/api/admin/book/step1');

  try {
    const [event, venue, shift, selectedPackage] = await Promise.all([
      Event.findByPk(booking.event_id),
      Venue.findByPk(booking.venue_id),
      Shift.findByPk(booking.shift_id),
      Package.findByPk(booking.package_id),
    ]);

    const selectedMenus = JSON.parse(booking.selected_menus || '[]');
    let totalExtra = 0;

    for (const menuGroup of selectedMenus) {
      const menu = await Menu.findByPk(menuGroup.menu_id);
      if (!menu) continue;

      const extraItems = Math.max(menuGroup.items.length - menu.free_limit, 0);
      totalExtra += extraItems * menu.extra_price_per_item;
    }

    const totalFare = (selectedPackage.base_price + totalExtra) * booking.guest_count;
    booking.total_fare = totalFare;

    res.render('book.step4', {
      event, venue, shift, package: selectedPackage,
      guest_count: booking.guest_count,
      name: booking.name,
      email: booking.email,
      selectedMenus,
      totalFare,
    });
  } catch (error) {
    console.error('Error in step4:', error);
    res.status(500).send('Error generating confirmation.');
  }
};

// Final: Save to DB
exports.storeBooking = async (req, res) => {
  const { booking } = req.session;

  if (!booking) return res.status(400).send('No booking in session.');

  try {
    const savedBooking = await Booking.create({
      user_id: req.user ? req.user.id : null,
      event_id: booking.event_id,
      venue_id: booking.venue_id,
      shift_id: booking.shift_id,
      package_id: booking.package_id,
      event_date: booking.event_date,
      guest_count: booking.guest_count,
      selected_menus: booking.selected_menus,
      total_fare: booking.total_fare,
      status: 'pending',
    });

    delete req.session.booking;
    res.redirect('/api/admin/book/step1'); // Redirect back or to a thank-you page
  } catch (error) {
    console.error('Error storing booking:', error);
    res.status(500).send('Failed to store booking.');
  }
};
