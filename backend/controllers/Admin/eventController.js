const { body, validationResult } = require('express-validator');
const Event = require('../../models/event');

const eventController = {
  // Get all events
  index: async (req, res) => {
    try {
      const events = await Event.findAll(); // Using Sequelize or any ORM
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // Store a new event
  store: [
    // Validate the request body
    body('name').notEmpty().withMessage('Event name is required'),

    // Controller function
    async (req, res) => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        // Create the event
        const newEvent = await Event.create({
          name: req.body.name,
        });
        res.status(201).json({ success: true, event: newEvent });
      } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).send('Internal Server Error');
      }
    }
  ],

  // Update an existing event
  update: async (req, res) => {
    try {
      const { name } = req.body;
      const event = await Event.findByPk(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      if (!name) {
        return res.status(400).json({ message: 'Event name is required' });
      }

      event.name = name;
      await event.save();
      res.status(200).json(event);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // Delete an event
  destroy: async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      await event.destroy();
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

module.exports = eventController;
