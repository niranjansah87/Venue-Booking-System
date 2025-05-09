const { Admin } = require('../../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// POST /admin/profile/update
exports.updateProfile = async (req, res) => {
  const { name, email, password } = req.body;
  const adminSession = req.session.admin;

  if (!adminSession) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Manual validation
  const errors = [];

  if (name !== undefined && name.trim() === '') {
    errors.push({ field: 'name', message: 'Name cannot be empty' });
  }

  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (password !== undefined && password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  try {
    const admin = await Admin.findByPk(adminSession.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check email uniqueness only if email is changing
    if (email && email !== admin.email) {
      const existingEmail = await Admin.findOne({
        where: {
          email,
          id: { [Op.ne]: admin.id }
        }
      });

      if (existingEmail) {
        return res.status(409).json({ message: 'Email already taken' });
      }
    }

    // Update only provided fields
    if (name !== undefined) admin.name = name;
    if (email !== undefined) admin.email = email;
    if (password !== undefined) {
      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();

    return res.json({ message: 'Profile updated successfully.', admin });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};
