const express = require('express');
const router = express.Router();
const userController = require('../controllers/Admin/userController');

// Ensure admin is logged in before accessing any of the user management routes
router.use((req, res, next) => {
    if (!req.session.adminId) {
        return res.status(403).send('Access forbidden');
    }
    next();
});

// Display all users
router.get('/', userController.getAllUsers);

// Show form to create a new user
router.get('/create', (req, res) => {
    res.render('admin/users/create');
});

// Store the new user
router.post('/', userController.createUser);

// Show form to edit an existing user
router.get('/:id/edit', userController.editUser);

// Update the user details
router.put('/:id', userController.updateUser);

// Delete a user
router.delete('/:id', userController.deleteUser);

module.exports = router;
