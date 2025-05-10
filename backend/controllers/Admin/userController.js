const bcrypt = require('bcrypt');
const { User, Sequelize } = require('../../models');

const { generateToken } = require('../../utils/token');
const sendEmail = require('../../utils/sendEmail');
// Admin-only user management controller






exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email'], // Select specific fields for security
        });
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

exports.createUser = async (req, res) => {
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
   
       res.status(201).json({ message: 'User added Successfully. Please check your email to verify your account.' });
     } catch (err) {
       console.error('Signup error:', err);
       res.status(500).json({ message: 'Internal server error during signup.' });
     }
};


exports.updateUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).send('Name and email are required');
        }

        const user = await User.findByPk(req.params.id);
        const emailExists = await User.findOne({
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

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        await user.destroy();
        res.status(201).json({ message: 'User deleted successfully.' });
    } catch (err) {
        res.status(500).send('Error deleting user');
    }
};
