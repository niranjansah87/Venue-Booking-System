// models/admin.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
   
  }, {
    tableName: 'admins',
    timestamps: true
  });

  return Admin;
};
