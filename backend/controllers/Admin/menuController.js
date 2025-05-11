const db = require('../../models');
const Menu = db.Menu;
const Package = db.Package;

exports.displayMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      include: [{ model: Package, as: 'package' }]
    });
    res.json(menus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching menus' });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const { package_id, name, items, free_limit } = req.body;

    if (!package_id || !name || !Array.isArray(items) || typeof free_limit !== 'number') {
      return res.status(400).json({ error: 'All fields are required and must be valid' });
    }

    const pkg = await Package.findByPk(package_id);
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package_id. Package does not exist.' });
    }

    const newMenu = await Menu.create({
      package_id,
      name,
      items,
      free_limit
    });

    res.status(201).json({ message: 'Menu created successfully', menu: newMenu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating menu' });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { name, items, free_limit } = req.body;
    const { package_id, id: menu_id } = req.params;
    const updateFields = {};

    if (package_id) {
      const pkg = await Package.findByPk(package_id);
      if (!pkg) {
        return res.status(400).json({ error: 'Invalid package_id. Package does not exist.' });
      }
      updateFields.package_id = package_id;
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Invalid name' });
      }
      updateFields.name = name;
    }

    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Items must be an array' });
      }
      updateFields.items = items;
    }

    if (free_limit !== undefined) {
      if (typeof free_limit !== 'number') {
        return res.status(400).json({ error: 'Free limit must be a number' });
      }
      updateFields.free_limit = free_limit;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'At least one valid field is required to update' });
    }

    const [updated] = await Menu.update(updateFields, {
      where: { id: menu_id },
    });

    if (!updated) {
      return res.status(404).json({ error: 'Menu not found or no changes applied' });
    }

    res.json({ message: 'Menu updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating menu' });
  }
};



exports.deleteMenu = async (req, res) => {
  try {
    await Menu.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Menu deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting menu' });
  }
};
