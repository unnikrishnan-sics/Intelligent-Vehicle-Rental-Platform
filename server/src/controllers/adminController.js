const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    console.log("Admin Stats Request Received from:", req.user.email);
    try {
        // Run all queries in parallel for performance
        const [
            userCount,
            vehicleCount,
            activeBookingCount,
            totalRevenueResult
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Vehicle.countDocuments(),
            Booking.countDocuments({ status: 'active' }),
            Booking.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ])
        ]);

        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        res.json({
            users: userCount,
            vehicles: vehicleCount,
            activeBookings: activeBookingCount,
            revenue: totalRevenue
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
