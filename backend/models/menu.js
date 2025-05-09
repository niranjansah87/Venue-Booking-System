const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Menu = sequelize.define('Menu', {
    package_id: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false
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
      as: 'package',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Menu;
};
