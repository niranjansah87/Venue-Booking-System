// models/index.js

const User = require('./users');
const Admin = require('./admin');
const Event = require('./event');
const Venue = require('./venue');
const Shift = require('./shift');
const Package = require('./package');
const Menu = require('./menu');
const Booking = require('./booking');

module.exports = {
  User,
  Admin,
  Event,
  Venue,
  Shift,
  Package,
  Menu,
  Booking
};
