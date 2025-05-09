const bcrypt = require('bcrypt');
const { User, Sequelize } = require('../../models');

// Admin-only user management controller

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('admin/users/index', { users });
    } catch (err) {
        res.status(500).send('Error fetching users');
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, phone, password, password_confirmation } = req.body;

        if (!name || !phone || !password || password !== password_confirmation) {
            return res.status(400).send('Invalid input data');
        }

        const userExists = await User.findOne({ where: { phone } });
        if (userExists) {
            return res.status(400).send('Phone number already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, phone, password: hashedPassword });

        res.redirect('/admin/users?success=User created successfully.');
    } catch (err) {
        res.status(500).send('Error creating user');
    }
};

exports.editUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        res.render('admin/users/edit', { user });
    } catch (err) {
        res.status(500).send('Error fetching user');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, phone, password, password_confirmation } = req.body;

        if (!name || !phone) {
            return res.status(400).send('Name and phone are required');
        }

        const user = await User.findByPk(req.params.id);
        const phoneExists = await User.findOne({
            where: {
                phone,
                id: { [Sequelize.Op.ne]: req.params.id },
            },
        });

        if (phoneExists) {
            return res.status(400).send('Phone number already exists');
        }

        const updateData = { name, phone };
        if (password && password === password_confirmation) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await user.update(updateData);
        res.redirect('/admin/users?success=User updated successfully.');
    } catch (err) {
        res.status(500).send('Error updating user');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        await user.destroy();
        res.redirect('/admin/users?success=User deleted successfully.');
    } catch (err) {
        res.status(500).send('Error deleting user');
    }
};
