const express = require('express');
const router = express.Router();
const authController = require('../controllers/userAuthController');

router.post('/signup', authController.signup);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/user/:id', authController.getUserById);
router.put('/user/:id', authController.updateProfile);
router.post('/update-password', authController.updatePassword);
router.post('/request-reset', authController.requestReset);
router.post('/reset-password', authController.resetPassword);
router.post('/check-session', authController.checkSession);
module.exports = router;