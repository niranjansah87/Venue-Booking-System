// models/user.js

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
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
    email_verified_at: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // Email is initially not verified
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  // Hook to hash password before saving
  User.beforeCreate(async (user, options) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  // Method to get initials
  User.prototype.initials = function () {
    return this.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return User;
};
