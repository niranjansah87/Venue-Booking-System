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
    const { package_id, name, items, free_limit } = req.body;

    if (!package_id || !name || !Array.isArray(items) || typeof free_limit !== 'number') {
      return res.status(400).json({ error: 'All fields are required and must be valid' });
    }

    const pkg = await Package.findByPk(package_id);
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package_id. Package does not exist.' });
    }

    await Menu.update(
      { package_id, name, items, free_limit },
      { where: { id: req.params.id } }
    );

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
