const { User } = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateToken } = require('../utils/token');
const sendEmail = require('../utils/sendEmail');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const { raw, hash } = generateToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    const user = await User.create({
      name,
      email,
      password,
      verification_token: hash,
      verification_token_expires: expires
    });

    const link = `${req.protocol}://${req.get('host')}/api/verify-email?token=${raw}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: 'Verify your email',
      html: `<p>Click to verify your email:</p><a href="${link}">${link}</a>`
    });

    res.status(201).json({ message: 'Signup successful. Please check your email to verify your account.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error during signup.' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token, email } = req.query;
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({ where: { email, verification_token: hash } });
  if (!user || user.verification_token_expires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired verification link.' });
  }

  user.email_verified = true;
  user.verification_token = null;
  user.verification_token_expires = null;
  await user.save();

  res.json({ message: 'Email verified. You may now log in.' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.email_verified) {
      return res.status(403).json({ message: 'Email not verified or user not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error during login' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

exports.updateName = async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name;
    await user.save();
    res.json({ message: 'Name updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating name' });
  }
};

exports.updateEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.email = email;
    user.email_verified = false;
    await user.save();
    const link = `${req.protocol}://${req.get('host')}/api/verify-email?token=${raw}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: 'Verify your email',
      html: `<p>Click to verify your email:</p><a href="${link}">${link}</a>`
    });

    
    res.json({ message: 'Email updated. Please verify again.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating email' });
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect current password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating password' });
  }
};

exports.requestReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.json({ message: 'If user exists, reset link sent.' });

  const { raw, hash } = generateToken();
  user.reset_password_token = hash;
  user.reset_password_expires = Date.now() + 30 * 60 * 1000;
  await user.save();

  const link = `${req.protocol}://${req.get('host')}/api/reset-password?token=${raw}&email=${email}`;
  await sendEmail({
    to: email,
    subject: 'Password Reset',
    html: `Click here to reset your password: <a href="${link}">${link}</a>`
  });

  res.json({ message: 'Reset link sent if user exists.' });
};

exports.resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({ where: { email, reset_password_token: hash } });
  if (!user || user.reset_password_expires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.reset_password_token = null;
  user.reset_password_expires = null;
  await user.save();

  res.json({ message: 'Password has been reset.' });
};
