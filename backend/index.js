const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const { User, Admin, Event, Venue, Shift, Package, Menu, Booking } = require('./models');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: Number(process.env.SESSION_MAX_AGE) || 30 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
  }
}));

// DB connection check
db.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch((err) => console.error('❌ DB connection error:', err));

// Sync models
db.sync()
  .then(() => console.log('✅ Models synchronized'))
  .catch((err) => console.error('❌ Model sync error:', err));

// Routes
const adminRoutes = require('./routes/admin');
const welcomeRoutes = require('./routes/welcomeRoutes');

app.get('/', (req, res) => {
  res.send('🎉 Welcome to the API!');
});

app.use('/api/admin', adminRoutes);
app.use('/api/book', welcomeRoutes); // Updated path for consistency (see note below)

// Session test route
app.get('/session', (req, res) => {
  res.send(req.session.user ? '✅ Session active' : '⚠️ No active session');
});

const userRoutes = require('./routes/adminUsersRoutes');
app.use('/admin/users', userRoutes); 


// 404 fallback
app.use((req, res) => {
  res.status(404).send('🚫 Page not found');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
