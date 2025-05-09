// models/Event.js (or similar file)
const { Model, DataTypes } = require('sequelize');
const db = require('../config/db');

// models/event.js
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });

  return Event;
};
