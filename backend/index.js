const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv'); // Load environment variables from .env file
const db = require('./config/db');
const { User, Admin, Event, Venue, Shift, Package, Menu, Booking } = require('./models');

dotenv.config(); // Load environment variables
const cookieParser = require('cookie-parser');


const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const adminRoutes = require('./routes/admin');
const bookRoutes = require('./routes/bookRoutes');
app.use(cookieParser());
// Middleware for JSON request parsing
app.use(express.json());
// Middlewares
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow frontend requests
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies to be sent along with the requests
}));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET, // Secret key for the session
  resave: false,
  saveUninitialized: false,
  cookie: {
  
    httpOnly: true,
     maxAge: Number(process.env.SESSION_MAX_AGE) || 30 * 60 * 1000, // Session timeout in milliseconds (default 30 minutes)
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

// Use the admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/book', bookRoutes);

// 404 Route (in case an unknown route is accessed)
app.use((req, res, next) => {
  res.status(404).send('Page not found');
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
