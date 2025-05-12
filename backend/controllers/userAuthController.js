const { User,Otp } = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateToken } = require('../utils/token');
const sendEmail = require('../utils/sendEmail');



exports.verifyEmail = async (req, res) => {
  const { token, email } = req.query;
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await User.findOne({ where: { email, verification_token: hash } });
    if (!user || user.verification_token_expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification link.' });
    }

    user.email_verified = true;
    user.verification_token = null;
    user.verification_token_expires = null;
    await user.save();

    res.json({ message: 'Email verified. You may now log in.' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Validate password format
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#_\-+])[A-Za-z\d@$!%*?&^#_\-+]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long, include one uppercase letter, one number, and one special character (@$!%*?&^#_-+).',
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const { raw, hash } = generateToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    // Do NOT hash password here; let the model hook handle it
    const user = await User.create({
      name,
      email,
      password, // Pass plaintext password
      verification_token: hash,
      verification_token_expires: expires,
      email_verified: false, // Explicitly set
    });

    const link = `${req.protocol}://${req.get('host')}/api/verify-email?token=${raw}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: 'Verify your email',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #4CAF50;">Email Verification Required</h2>
          <p style="font-size: 16px; color: #333;">
            Hello,
          </p>
          <p style="font-size: 16px; color: #333;">
            We received a request to update the email associated with your account. Please click the button below to verify your new email address:
          </p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email
            </a>
          </p>
          <p style="font-size: 14px; color: #666;">
            Or copy and paste this link into your browser:<br>
            <a href="${link}" style="color: #4CAF50;">${link}</a>
          </p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">
            If you didn’t request this change, please ignore this email or contact our support.
          </p>
        </div>
      `,
    });

    res.status(201).json({ message: 'Signup successful. Please check your email to verify your account.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error during signup.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.email_verified) {
      console.log('Email not verified for user:', email);
      return res.status(403).json({ message: 'Email not verified' });
    }

    // console.log('Login attempt - Email:', email);
    // console.log('Provided password:', password);
    // console.log('Stored password hash:', user.password);
    const match = await bcrypt.compare(password, user.password);
    // console.log('Password match:', match);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role || 'user' },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error during login' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    if (!req.session.userId || req.session.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only access your own data' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.params.id;

  try {

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validation
    const errors = [];
    if (name !== undefined && name.trim() === '') {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    }
    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }

    // Check email uniqueness
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already taken' });
      }
      user.email_verified = false;
      const { raw, hash } = generateToken();
      user.verification_token = hash;
      user.verification_token_expires = new Date(Date.now() + 1000 * 60 * 60);
      const link = `${req.protocol}://${req.get('host')}/api/verify-email?token=${raw}&email=${encodeURIComponent(email)}`;
      await sendEmail({
  to: email,
  subject: 'Verify Your New Email Address',
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
      <h2 style="color: #4CAF50;">Email Verification Required</h2>
      <p style="font-size: 16px; color: #333;">
        Hello,
      </p>
      <p style="font-size: 16px; color: #333;">
        We received a request to update the email associated with your account. Please click the button below to verify your new email address:
      </p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verify Email
        </a>
      </p>
      <p style="font-size: 14px; color: #666;">
        Or copy and paste this link into your browser:<br>
        <a href="${link}" style="color: #4CAF50;">${link}</a>
      </p>
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #999;">
        If you didn’t request this change, please ignore this email or contact our support.
      </p>
    </div>
  `,
});

    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    await user.save();

    res.json({
      message: 'Profile updated successfully. If you changed your email, please verify it.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role || 'user' },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error updating profile' });
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
    console.error('Update password error:', err);
    res.status(500).json({ message: 'Error updating password' });
  }
};

exports.requestReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.json({ message: 'If user exists, reset link sent.' });

    const { raw, hash } = generateToken();
    user.reset_password_token = hash;
    user.reset_password_expires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const link = `${req.protocol}://${req.get('host')}/api/reset-password?token=${raw}&email=${email}`;
    await sendEmail({
  to: email,
  subject: 'Reset Your Password',
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
      <h2 style="color: #d9534f;">Password Reset Request</h2>
      <p style="font-size: 16px; color: #333;">
        Hello,
      </p>
      <p style="font-size: 16px; color: #333;">
        We received a request to reset your account password. Click the button below to continue:
      </p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="display: inline-block; background-color: #d9534f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Reset Password
        </a>
      </p>
      <p style="font-size: 14px; color: #666;">
        Or copy and paste this link into your browser:<br>
        <a href="${link}" style="color: #d9534f;">${link}</a>
      </p>
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #999;">
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>
  `,
});


    res.json({ message: 'Reset link sent if user exists.' });
  } catch (err) {
    console.error('Request reset error:', err);
    res.status(500).json({ message: 'Error processing reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await User.findOne({ where: { email, reset_password_token: hash } });
    if (!user || user.reset_password_expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    res.json({ message: 'Password has been reset.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Error resetting password' });
  }
};


exports.checkSession = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Check session error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};







exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send('User ID is required');
        }

        // Find user
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Delete related OTPs
        await Otp.destroy({ where: { user_id: id } });

        // Now delete the user
        await user.destroy();

        res.status(200).json({ message: 'User and associated OTPs deleted successfully.' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).send('Error deleting user');
    }
};

