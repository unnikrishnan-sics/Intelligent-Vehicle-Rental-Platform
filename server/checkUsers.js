const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vehicle-rental');
        console.log('--- Database Check ---');

        const admin = await User.findOne({ email: 'admin@gmail.com' });
        if (admin) {
            console.log('Admin user found:');
            console.log(`- ID: ${admin._id}`);
            console.log(`- Name: ${admin.name}`);
            console.log(`- Email: ${admin.email}`);
            console.log(`- Role: ${admin.role}`);
        } else {
            console.log('CRITICAL: admin@gmail.com NOT FOUND in database.');
        }

        const totalUsers = await User.countDocuments({});
        console.log(`Total users in DB: ${totalUsers}`);

        await mongoose.connection.close();
        console.log('----------------------');
    } catch (err) {
        console.error('Error:', err.message);
    }
};

checkUsers();
