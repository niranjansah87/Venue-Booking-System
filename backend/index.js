// index.js

const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Import db.js to set up Sequelize
const { User, Admin, Event, Venue, Shift, Package, Menu, Booking } = require('./models'); // Import all models

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes

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

// Routes (Add your route handlers here)
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
