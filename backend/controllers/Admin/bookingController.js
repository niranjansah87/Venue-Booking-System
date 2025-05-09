// controllers/bookingController.js
const { Event, Venue, Shift, Package, Menu, Booking, User } = require('../../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// In-memory store for booking sessions
const bookingSessions = {};

// List all bookings
exports.listBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: Event, as: 'event' },
                { model: Venue, as: 'venue' },
                { model: Shift, as: 'shift' },
                { model: Package, as: 'package' },
                { model: User, as: 'user' }
            ],
            order: [['event_date', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                { model: Event, as: 'event' },
                { model: Venue, as: 'venue' },
                { model: Shift, as: 'shift' },
                { model: Package, as: 'package' },
                { model: User, as: 'user' }
            ]
        });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Update a booking
exports.updateBooking = async (req, res) => {
    try {
        const { event_id, venue_id, shift_id, package_id, guest_count, event_date, status } = req.body;

        const [updated] = await Booking.update(
            { event_id, venue_id, shift_id, package_id, guest_count, event_date, status },
            { where: { id: req.params.id } }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: 'Booking updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
        const deleted = await Booking.destroy({ where: { id: req.params.id } });

        if (!deleted) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Initiate booking process
exports.initiateBooking = async (req, res) => {
    try {
        const [events, venues, shifts] = await Promise.all([
            Event.findAll(),
            Venue.findAll(),
            Shift.findAll()
        ]);
        const sessionId = uuidv4();
        bookingSessions[sessionId] = {};
        res.json({
            sessionId,
            events,
            venues,
            shifts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Check booking availability
exports.checkBookingAvailability = async (req, res) => {
    try {
        const { sessionId, event_id, venue_id, shift_id, event_date, guest_count, action } = req.body;

        if (!bookingSessions[sessionId]) {
            return res.status(400).json({ error: 'Invalid session ID' });
        }

        const venue = await Venue.findByPk(venue_id);
        if (!venue) {
            return res.status(400).json({ error: 'Invalid venue selected' });
        }
        if (guest_count > venue.capacity) {
            return res.status(400).json({ error: `Guest count exceeds venue capacity of ${venue.capacity}` });
        }

        const conflict = await Booking.findOne({
            where: { event_date, venue_id, shift_id, status: 'confirmed' }
        });

        if (conflict) {
            return res.status(400).json({ error: 'Selected slot is not available' });
        }

        const step1Data = { event_id, venue_id, shift_id, event_date, guest_count };
        bookingSessions[sessionId].step1 = step1Data;
        bookingSessions[sessionId].originalStep1 = { ...step1Data };

        if (action === 'proceed') {
            const currentData = { event_id, venue_id, shift_id, event_date, guest_count };
            const storedData = bookingSessions[sessionId].originalStep1;
            const changed = Object.keys(currentData).some(key => currentData[key] !== storedData[key]);
            if (changed) {
                return res.status(400).json({ error: 'Form data has changed. Please recheck availability.' });
            }
            return res.json({ message: 'Proceed to package selection', nextStep: '/api/admin/bookings/select-package' });
        }

        res.json({ message: 'Booking slot is available', sessionId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get packages for selection
exports.getPackagesForSelection = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId || !bookingSessions[sessionId] || !bookingSessions[sessionId].step1) {
            return res.status(400).json({ error: 'Invalid or expired session. Please start over.' });
        }
        const { step1, originalStep1 } = bookingSessions[sessionId];
        if (JSON.stringify(step1) !== JSON.stringify(originalStep1)) {
            delete bookingSessions[sessionId];
            return res.status(400).json({ error: 'Data mismatch detected. Please restart booking process.' });
        }

        const packages = await Package.findAll({
            include: [{ model: Menu, as: 'menus' }]
        });
        res.json({ sessionId, packages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Calculate booking fare
exports.calculateBookingFare = async (req, res) => {
    try {
        const { sessionId, package_id, menus } = req.body;

        if (!bookingSessions[sessionId] || !bookingSessions[sessionId].step1) {
            return res.status(400).json({ error: 'Invalid or expired session. Please start over.' });
        }

        const packageData = await Package.findByPk(package_id, {
            include: [{ model: Menu, as: 'menus' }]
        });
        if (!packageData) {
            return res.status(400).json({ error: 'Invalid package selected' });
        }

        const guestCount = parseInt(bookingSessions[sessionId].step1.guest_count);
        let extraFare = 0;
        if (menus) {
            for (const [menuId, indexes] of Object.entries(menus)) {
                const menu = packageData.menus.find(m => m.id.toString() === menuId);
                if (!menu) {
                    return res.status(400).json({ error: `Invalid menu ID: ${menuId}` });
                }
                const validIndexes = indexes.map(i => parseInt(i)).filter(i => i < menu.items.length);
                for (const index of validIndexes) {
                    if (index >= menu.free_limit) {
                        extraFare += menu.items[index]?.price || 0;
                    }
                }
            }
        }

        const totalFare = (packageData.base_price + extraFare) * guestCount;
        bookingSessions[sessionId].step2 = {
            package_id,
            menus,
            total_fare: totalFare
        };

        res.json({ message: 'Fare calculated', total_fare: totalFare, nextStep: '/api/admin/bookings/user-info' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get booking summary for user info
exports.getBookingSummary = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId || !bookingSessions[sessionId] || !bookingSessions[sessionId].step1 || !bookingSessions[sessionId].step2) {
            return res.status(400).json({ error: 'Invalid or expired session. Please start over.' });
        }

        const { step1, step2 } = bookingSessions[sessionId];
        const [event, shift, venue, pkg] = await Promise.all([
            Event.findByPk(step1.event_id),
            Shift.findByPk(step1.shift_id),
            Venue.findByPk(step1.venue_id),
            Package.findByPk(step2.package_id)
        ]);

        res.json({
            sessionId,
            event_date: step1.event_date,
            event: event || {},
            shift: shift || {},
            venue: venue || {},
            package: pkg || {},
            guest_count: step1.guest_count,
            menus: step2.menus,
            total_fare: step2.total_fare
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Store the booking
exports.storeBooking = async (req, res) => {
    try {
        const { sessionId, name, phone } = req.body;

        if (!bookingSessions[sessionId] || !bookingSessions[sessionId].step1 || !bookingSessions[sessionId].step2) {
            return res.status(400).json({ error: 'Invalid or expired session. Please start over.' });
        }

        const { step1, step2 } = bookingSessions[sessionId];

        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
            return res.status(400).json({ error: 'Phone number already exists' });
        }

        const user = await User.create({
            name,
            phone,
            password: await bcrypt.hash('password', 10)
        });

        const booking = await Booking.create({
            user_id: user.id,
            event_id: step1.event_id,
            venue_id: step1.venue_id,
            shift_id: step1.shift_id,
            package_id: step2.package_id,
            event_date: step1.event_date,
            guest_count: step1.guest_count,
            selected_menus: step2.menus,
            total_fare: step2.total_fare,
            status: 'pending'
        });

        delete bookingSessions[sessionId];
        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get menus for a package
exports.getBookingPackageMenus = async (req, res) => {
    try {
        const packageData = await Package.findByPk(req.params.packageId, {
            include: [{ model: Menu, as: 'menus' }]
        });
        if (!packageData) {
            return res.status(404).json({ error: 'Package not found' });
        }
        const menus = packageData.menus.map(menu => ({
            id: menu.id,
            name: menu.name,
            items: menu.items,
            free_limit: menu.free_limit
        }));
        res.json(menus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to fetch menus' });
    }
};

module.exports = exports;