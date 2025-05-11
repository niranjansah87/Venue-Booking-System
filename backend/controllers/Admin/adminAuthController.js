const { Admin } = require('../../models');  // Ensure this is correctly pointing to your models

const bcrypt = require('bcrypt');

// Admin Signup
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword
    });

    req.session.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email
    };

    return res.status(201).json({ message: 'Admin registered successfully', admin });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Failed to register admin' });
  }
};

// Admin Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email
    };

    return res.status(200).json({ message: 'Logged in successfully', admin });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};


exports.updateAdmin = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).send('Name and email are required');
        }

        const user = await Admin.findByPk(req.params.id);
        const emailExists = await Admin.findOne({
            where: {
                email,
                id: { [Sequelize.Op.ne]: req.params.id },
            },
        });

        if (emailExists) {
            return res.status(400).send('email already exists');
        }

        const updateData = { name, email };
        
        await user.update(updateData);
        res.status(201).json({ message: 'User updated' });
    } catch (err) {
        res.status(500).send('Error updating user');
    }
};



// Admin Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};
