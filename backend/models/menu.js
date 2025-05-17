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
      allowNull: false,
      defaultValue: [], // Array of objects: [{ name: string, price: number }, ...]
      get() {
        const items = this.getDataValue('items');
        // Ensure items have price; default to 10 if missing
        return items.map(item => ({
          name: item.name || item,
          price: item.price != null ? item.price : 10
        }));
      }
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