const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Vehicle = require('./src/models/Vehicle');
const Booking = require('./src/models/Booking');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');

        const userCount = await User.countDocuments();
        const vehicleCount = await Vehicle.countDocuments();
        const activeBookings = await Booking.countDocuments({ status: 'active' });

        const revenueResult = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        console.log({
            userCount,
            vehicleCount,
            activeBookings,
            revenue
        });

        // Also check if there is an admin user
        const admin = await User.findOne({ role: 'admin' });
        console.log('Admin exists:', !!admin);

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
