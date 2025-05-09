const { Venue } = require('../../models'); // Sequelize model for Venue
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for handling image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/venues/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
}).single('image');

// Display all venues
exports.getAllVenues = async (req, res) => {
    try {
        const venues = await Venue.findAll();
        res.json(venues);
    } catch (err) {
        res.status(500).send('Error fetching venues');
    }
};

// Create a new venue
exports.createVenue = [upload, async (req, res) => {
    try {
        const { name, capacity } = req.body;

        if (!name || !capacity || !req.file) {
            return res.status(400).send('Invalid input data');
        }

        const imagePath = req.file.path.replace('public/', ''); // Store the path relative to 'public'

        const newVenue = await Venue.create({
            name,
            capacity,
            image: imagePath,
        });

        res.status(201).json({ message: 'Venue created successfully', venue: newVenue });
    } catch (err) {
        res.status(500).send('Error creating venue');
    }
}];

// Update a venue's name, capacity, and image
exports.updateVenue = [upload, async (req, res) => {
    try {
        const venue = await Venue.findByPk(req.params.id);
        if (!venue) {
            return res.status(404).send('Venue not found');
        }

        const { name, capacity } = req.body;
        const updatedData = {};

        if (name) updatedData.name = name;
        if (capacity) updatedData.capacity = capacity;

        if (req.file) {
            if (venue.image && fs.existsSync('public/' + venue.image)) {
                fs.unlinkSync('public/' + venue.image); // Delete old image
            }
            updatedData.image = req.file.path.replace('public/', ''); // Add new image
        }

        const updatedVenue = await venue.update(updatedData);

        res.json({ message: 'Venue updated successfully', venue: updatedVenue });
    } catch (err) {
        res.status(500).send('Error updating venue');
    }
}];

// Delete a venue
exports.deleteVenue = async (req, res) => {
    try {
        const venue = await Venue.findByPk(req.params.id);
        if (!venue) {
            return res.status(404).send('Venue not found');
        }

        // Delete the venue image if it exists
        if (venue.image && fs.existsSync('public/' + venue.image)) {
            fs.unlinkSync('public/' + venue.image);
        }

        await venue.destroy(); // Delete the venue record

        res.json({ message: 'Venue deleted successfully' });
    } catch (err) {
        res.status(500).send('Error deleting venue');
    }
};
