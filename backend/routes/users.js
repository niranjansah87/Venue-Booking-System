// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/userAuthController');

router.post('/signup', authController.signup);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/update-name', authController.updateName);
router.post('/update-email', authController.updateEmail);
router.post('/update-password', authController.updatePassword);
router.post('/request-reset', authController.requestReset);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
