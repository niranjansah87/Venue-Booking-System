// db.js

const { Sequelize } = require('sequelize');
const logger = require('../logs/logger');
// Set up a connection to the database
const sequelize = new Sequelize('venue_booking_system', 'root', '12345', {
  host: 'localhost',
  dialect: 'mysql',
  logging: (msg) => logger.info(msg), 
});




module.exports = sequelize;
