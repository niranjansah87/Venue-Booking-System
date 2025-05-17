const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const { User, Admin, Event, Venue, Shift, Package, Menu, Booking } = require('./models');
const path = require('path');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000', // If another frontend port is used
  undefined,
  
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, origin); // Reflect the requesting origin
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'licencia-type'],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browsers
}));

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: Number(process.env.SESSION_MAX_AGE) || 30 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
  },
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
const adminuserRoutes = require('./routes/adminUsersRoutes');
const userRoutes = require('./routes/users');

app.get('/', (req, res) => {
  res.send('🎉 Welcome to the API!');
});

app.use('/api/admin', adminRoutes);
app.use('/api/admin/book', welcomeRoutes);
app.use('/admin/auth', adminuserRoutes);
app.use('/api', userRoutes);

// Session test route
app.get('/session', (req, res) => {
  res.send(req.session.user ? '✅ Session active' : '⚠️ No active session');
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send('🚫 Page not found');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});