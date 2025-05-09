const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

module.exports = async function sendEmail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: `"Venue Booking" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });
        console.log('✅ Email sent to:', to);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
};
