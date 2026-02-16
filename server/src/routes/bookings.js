const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/', protect, admin, getAllBookings);
router.put('/:id/status', protect, admin, updateBookingStatus);

module.exports = router;
