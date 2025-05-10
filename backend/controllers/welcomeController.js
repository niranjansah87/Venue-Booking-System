const { Event, Venue, Shift, Package, Menu, Booking } = require('../models');
const { Op } = require('sequelize');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/otp');

// Step 1: Show form (Event, Venue, Shift selection)
exports.step1 = async (req, res) => {
  try {
    const [events, venues, shifts] = await Promise.all([
      Event.findAll(),
      Venue.findAll(),
      Shift.findAll(),
    ]);

    // Inline Handlebars template
    const template = `
      <h2>Step 1: Event Details</h2>
      <form action="/api/admin/book/step1" method="POST">
        <div>
          <label for="event_id">Event Type</label>
          <select id="event_id" name="event_id" required>
            <option value="">Select Event</option>
            {{#each events}}
              <option value="{{id}}">{{name}}</option>
            {{/each}}
          </select>
        </div>
        <div>
          <label for="venue_id">Venue</label>
          <select id="venue_id" name="venue_id" required>
            <option value="">Select Venue</option>
            {{#each venues}}
              <option value="{{id}}">{{name}}</option>
            {{/each}}
          </select>
        </div>
        <div>
          <label for="shift_id">Shift</label>
          <select id="shift_id" name="shift_id" required>
            <option value="">Select Shift</option>
            {{#each shifts}}
              <option value="{{id}}">{{name}}</option>
            {{/each}}
          </select>
        </div>
        <div>
          <label for="event_date">Event Date</label>
          <input type="date" id="event_date" name="event_date" required>
        </div>
        <div>
          <label for="guest_count">Guest Count</label>
          <input type="number" id="guest_count" name="guest_count" min="10" required>
        </div>
        <button type="submit">Next</button>
      </form>
    `;

    res.render('inline', {
      layout: false,
      events,
      venues,
      shifts,
      user: req.user,
      template,
    });
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
      where: { event_date, venue_id, shift_id, status: 'confirmed' },
    });

    if (isBooked) {
      return res.status(409).send('Selected slot is already booked.');
    }

    req.session.booking = {
      event_id,
      event_date,
      guest_count: parseInt(guest_count),
      venue_id,
      shift_id,
    };

    res.redirect('/api/admin/book/step2');
  } catch (error) {
    console.error('Error in step1Post:', error);
    res.status(500).send('Failed to process booking.');
  }
};

// Step 2: Show packages and menus
exports.step2 = async (req, res) => {
  try {
    const packages = await Package.findAll();

    // Inline Handlebars template
    const template = `
      <h2>Step 2: Package and Menus</h2>
      <form action="/api/admin/book/step2" method="POST">
        <div>
          <label for="package_id">Package</label>
          <select id="package_id" name="package_id" required>
            <option value="">Select Package</option>
            {{#each packages}}
              <option value="{{id}}">{{name}}</option>
            {{/each}}
          </select>
        </div>
        <div>
          <label for="selected_menus">Menus (Enter as JSON)</label>
          <textarea id="selected_menus" name="selected_menus" required></textarea>
          <p>Example: [{"menu_id": 1, "items": ["item1", "item2"]}]</p>
        </div>
        <button type="submit">Next</button>
      </form>
    `;

    res.render('inline', {
      layout: false,
      packages,
      user: req.user,
      template,
    });
  } catch (error) {
    console.error('Error in step2:', error);
    res.status(500).send('Unable to load packages.');
  }
};

// Step 2: Handle package and menu selection
exports.step2Post = (req, res) => {
  const { package_id, selected_menus } = req.body;

  if (!package_id || !selected_menus) {
    return res.status(400).send('Package and menu selection required.');
  }

  try {
    // Validate JSON format
    let parsedMenus;
    try {
      parsedMenus = JSON.parse(selected_menus);
    } catch (parseErr) {
      return res.status(400).send('Invalid JSON format in menu selection.');
    }

    req.session.booking.package_id = package_id;
    req.session.booking.selected_menus = JSON.stringify(parsedMenus); // store as stringified JSON
    res.redirect('/api/admin/book/step3');
  } catch (error) {
    console.error('Error in step2Post:', error);
    res.status(500).send('Error saving menu selection.');
  }
};


// Step 3: Show guest information form (pre-filled with user data)
exports.step3 = (req, res) => {
  const { booking } = req.session;
  if (!booking) {
    return res.redirect('/api/admin/book/step1');
  }

  // Inline Handlebars template
  const template = `
    <h2>Step 3: Guest Information</h2>
    <form id="guestForm" action="/api/admin/book/step3" method="POST">
      <div>
        <label for="name">Name</label>
        <input type="text" id="name" name="name" value="{{name}}" required>
      </div>
      <div>
        <label for="email">Email</label>
        <input type="email" id="email" value="{{email}}" disabled>
      </div>
      <div>
        <button type="button" onclick="sendOtp()">Send OTP</button>
      </div>
      <div id="otpSection" style="display: none;">
        <label for="otp">OTP</label>
        <input type="text" id="otp" name="otp" required>
      </div>
      <button type="submit" id="submitBtn" disabled>Next</button>
    </form>
    <script>
      async function sendOtp() {
        try {
          const response = await fetch('/api/admin/book/send-otp', { method: 'POST' });
          const result = await response.json();
          if (result.sent) {
            document.getElementById('otpSection').style.display = 'block';
            document.getElementById('submitBtn').disabled = false;
            alert('OTP sent to {{email}}');
          } else {
            alert('Failed to send OTP');
          }
        } catch (error) {
          alert('Error sending OTP');
        }
      }
    </script>
  `;

  res.render('inline', {
    layout: false,
    user: req.user,
    name: req.user.name,
    email: req.user.email,
    template,
  });
};

// Step 3: Send OTP to logged-in user's email
exports.sendOTP = async (req, res) => {
  try {
    const email = req.user.email; // Use logged-in user's email
    if (!email || !email.includes('@')) {
      return res.status(400).send('Valid email is required.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    req.session.verificationOTP = otp;

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
        &copy; ${new Date().getFullYear()} Venue Booking System
      </p>
    </div>
  `,
});


    if (success) {
      res.json({ sent: true });
    } else {
      res.status(500).send('Failed to send OTP.');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send('Failed to send OTP.');
  }
};

// Step 3: Verify OTP & Guest Info
exports.step3Post = (req, res) => {
  const { name, otp } = req.body;

  if (!name || !otp) {
    return res.status(400).send('Name and OTP are required.');
  }

  if (parseInt(otp) !== req.session.verificationOTP) {
    return res.status(401).send('Invalid OTP.');
  }

  try {
    req.session.booking.name = name;
    req.session.booking.email = req.user.email; // Use logged-in user's email
    delete req.session.verificationOTP;
    res.redirect('/api/admin/book/step4');
  } catch (error) {
    console.error('Error in step3Post:', error);
    res.status(500).send('Error saving guest information.');
  }
};

// Step 4: Show confirmation
exports.step4 = async (req, res) => {
  const { booking } = req.session;

  if (!booking) {
    return res.redirect('/api/admin/book/step1');
  }

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

    // Inline Handlebars template
    const template = `
      <h2>Step 4: Booking Confirmation</h2>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Event:</strong> {{event.name}}</p>
      <p><strong>Venue:</strong> {{venue.name}}</p>
      <p><strong>Shift:</strong> {{shift.name}}</p>
      <p><strong>Date:</strong> {{event_date}}</p>
      <p><strong>Guest Count:</strong> {{guest_count}}</p>
      <p><strong>Package:</strong> {{package.name}}</p>
      <p><strong>Total Fare:</strong> ${{totalFare}}</p>
      <form action="/api/admin/book/store" method="POST">
        <button type="submit">Confirm Booking</button>
      </form>
    `;

    res.render('inline', {
      layout: false,
      event,
      venue,
      shift,
      package: selectedPackage,
      guest_count: booking.guest_count,
      name: booking.name,
      email: booking.email,
      selectedMenus,
      totalFare,
      event_date: booking.event_date,
      user: req.user,
      template,
    });
  } catch (error) {
    console.error('Error in step4:', error);
    res.status(500).send('Error generating confirmation.');
  }
};

// Final: Save to DB and send confirmation email
exports.storeBooking = async (req, res) => {
  const { booking } = req.session;

  if (!booking) {
    return res.status(400).send('No booking in session.');
  }

  try {
    const savedBooking = await Booking.create({
      user_id: req.user.id, // Required since user is authenticated
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

    // Send confirmation email
    const success = await sendEmail({
      to: booking.email,
      subject: 'Booking Confirmation - Elegance Venues',
      html: `
        <h2>Booking Confirmation</h2>
        <p>Dear ${booking.name},</p>
        <p>Thank you for your booking with Elegance Venues! Your booking has been successfully confirmed.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${savedBooking.id}</li>
          <li><strong>Date:</strong> ${booking.event_date}</li>
          <li><strong>Venue ID:</strong> ${booking.venue_id}</li>
          <li><strong>Total Fare:</strong> $${booking.total_fare}</li>
        </ul>
        <p>We look forward to hosting your event. If you have any questions, please contact us.</p>
        <p>Best regards,<br>Elegance Venues Team</p>
      `,
    });

    if (!success) {
      console.warn('Confirmation email failed to send, but booking was saved.');
    }

    delete req.session.booking;

    // Inline Handlebars template for confirmation
    const template = `
      <h2>Booking Confirmed</h2>
      <p>Dear {{user.name}},</p>
      <p>Your booking has been successfully confirmed. A confirmation email has been sent to {{user.email}}.</p>
      <a href="/">Return to Home</a>
    `;

    res.render('inline', {
      layout: false,
      user: req.user,
      template,
    });
  } catch (error) {
    console.error('Error storing booking:', error);
    res.status(500).send('Failed to store booking.');
  }
};



// In welcomeController.js


exports.sendOTP = async (req, res) => {
  try {
    const email = req.body.email || req.user?.email;
    if (!email || !email.includes('@')) {
      return res.status(400).send('Valid email is required.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    req.session.verificationOTP = otp;

    const success = await sendEmail({
      to: email,
      subject: 'Venue Booking OTP Verification',
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    if (success) {
      res.json({ sent: true });
    } else {
      res.status(500).send('Failed to send OTP.');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send('Failed to send OTP.');
  }
};

exports.step3Post = (req, res) => {
  const { name, otp } = req.body;

  if (!name || !otp) {
    return res.status(400).send('Name and OTP are required.');
  }

  if (parseInt(otp) !== req.session.verificationOTP) {
    return res.status(401).send('Invalid OTP.');
  }

  try {
    req.session.booking.name = name;
    req.session.booking.email = req.user.email;
    delete req.session.verificationOTP;
    res.redirect('/api/admin/book/step4');
  } catch (error) {
    console.error('Error in step3Post:', error);
    res.status(500).send('Error saving guest information.');
  }
};
