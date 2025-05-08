// db.js

const { Sequelize } = require('sequelize');

// Set up a connection to the database
const sequelize = new Sequelize('venue_booking_system', 'root', '12345', {
  host: 'localhost',
  dialect: 'mysql',
  logging: true, 
});

module.exports = sequelize;
