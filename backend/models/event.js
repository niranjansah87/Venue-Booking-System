// models/Event.js (or similar file)
const { Model, DataTypes } = require('sequelize');
const db = require('../config/db');

class Event extends Model {}

Event.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize: db, // The Sequelize instance
  modelName: 'Event', // Model name
});

module.exports = Event;
