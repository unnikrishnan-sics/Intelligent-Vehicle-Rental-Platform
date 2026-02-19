const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User'); // Import User model to fetch details if needed
const { sendBookingConfirmation, sendPaymentReceipt, sendBookingStatusUpdate } = require('../utils/emailService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const { vehicleId, startDate, endDate, totalPrice } = req.body;

        // Check if user already has an active booking
        const existingBooking = await Booking.findOne({
            user: req.user.id,
            status: { $in: ['pending', 'confirmed', 'active'] }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'You already have an active booking. Only one vehicle can be rented at a time.' });
        }

        const booking = await Booking.create({
            user: req.user.id,
            vehicle: vehicleId,
            startDate,
            endDate,
            totalPrice,
            status: 'active', // Auto-activate for immediate tracking demo
            paymentStatus: 'paid' // Simulating payment
        });

        // Fetch user and vehicle details for email
        const user = await User.findById(req.user.id);
        const vehicle = await Vehicle.findById(vehicleId);

        // Send Confirmation & Receipt Emails (Async - don't block response)
        sendBookingConfirmation(user, booking, vehicle).catch(err => console.error("Confirmation Email Failed:", err));
        sendPaymentReceipt(user, booking, vehicle, totalPrice).catch(err => console.error("Receipt Email Failed:", err));

        // Update vehicle status to rented? 
        // Usually we check availability by dates, but for simplicity let's mark it 'rented' if it's a current booking
        // For now, allow multiple bookings but maybe warn if overlapping (Future feature)

        res.status(201).json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('vehicle')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('vehicle')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;

        // If completed, maybe update vehicle status back to available?
        // Logic can be expanded here

        // If completed, update vehicle status to 'cleaning'
        // Update Vehicle Status based on Booking Status
        const Vehicle = require('../models/Vehicle');

        if (status === 'completed') {
            await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'cleaning' });
        } else if (status === 'cancelled') {
            await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'available' });
        }

        await booking.save();

        // Return updated booking with populated fields
        const updatedBooking = await Booking.findById(req.params.id)
            .populate('user', 'name email')
            .populate('vehicle');

        // Send Status Update Email
        if (updatedBooking.user && updatedBooking.vehicle) {
            sendBookingStatusUpdate(updatedBooking.user, updatedBooking, updatedBooking.vehicle, status)
                .catch(err => console.error("Status Update Email Failed:", err));
        }

        res.json(updatedBooking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
