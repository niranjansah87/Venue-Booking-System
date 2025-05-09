const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../../models'); // Sequelize model for User
const router = express.Router();

// Display all users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll(); // Fetch all users from the database
        res.render('admin/users/index', { users });
    } catch (err) {
        res.status(500).send('Error fetching users');
    }
});

// Show form to create a new user
router.get('/create', (req, res) => {
    res.render('admin/users/create');
});

// Store the new user
router.post('/', async (req, res) => {
    try {
        const { name, phone, password, password_confirmation } = req.body;

        // Validation
        if (!name || !phone || !password || password !== password_confirmation) {
            return res.status(400).send('Invalid input data');
        }

        const userExists = await User.findOne({ where: { phone } });
        if (userExists) {
            return res.status(400).send('Phone number already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, phone, password: hashedPassword });

        res.redirect('/admin/users?success=User created successfully.');
    } catch (err) {
        res.status(500).send('Error creating user');
    }
});

// Show form to edit an existing user
router.get('/:id/edit', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id); // Use findByPk for Sequelize
        res.render('admin/users/edit', { user });
    } catch (err) {
        res.status(500).send('Error fetching user');
    }
});

// Update the user details
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, password, password_confirmation } = req.body;

        // Validation
        if (!name || !phone) {
            return res.status(400).send('Name and phone are required');
        }

        const user = await User.findByPk(req.params.id);

        // Check if phone is unique, excluding current user
        const phoneExists = await User.findOne({ where: { phone, id: { [Sequelize.Op.ne]: req.params.id } } });
        if (phoneExists) {
            return res.status(400).send('Phone number already exists');
        }

        const updateData = { name, phone };

        // If password is provided and confirmed, hash it
        if (password && password === password_confirmation) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await user.update(updateData); // Update the user in the database
        res.redirect('/admin/users?success=User updated successfully.');
    } catch (err) {
        res.status(500).send('Error updating user');
    }
});

// Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        await user.destroy(); // Delete the user
        res.redirect('/admin/users?success=User deleted successfully.');
    } catch (err) {
        res.status(500).send('Error deleting user');
    }
});

module.exports = router;
