// models/menu.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Menu = sequelize.define('Menu', {
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'packages',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    items: {
      type: DataTypes.JSON // Casts JSON to JS array/object
    },
    free_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'menus',
    timestamps: true
  });

  Menu.associate = (models) => {
    Menu.belongsTo(models.Package, {
      foreignKey: 'package_id',
      as: 'package'
    });
  };

  return Menu;
};
