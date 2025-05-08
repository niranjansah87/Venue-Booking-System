const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./config/db');
const { User, Admin, Event, Venue, Shift, Package, Menu, Booking } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET, // Secret key for the session
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: process.env.SESSION_MAX_AGE || 30 * 60 * 1000, // Session timeout in milliseconds (default 30 minutes)
    secure: process.env.NODE_ENV === 'production', // Use secure cookies only in production
  }
}));

// Test the database connection
db.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

// Sync Sequelize models with the database
db.sync()
  .then(() => {
    console.log('All models are synchronized.');
  })
  .catch((error) => {
    console.error('Error syncing models:', error);
  });

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Example route for session management
app.get('/session', (req, res) => {
  if (req.session.user) {
    res.send('Session is active!');
  } else {
    res.send('No active session.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
