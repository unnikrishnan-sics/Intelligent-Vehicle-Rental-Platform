const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load Models
const User = require('./src/models/User');
const Vehicle = require('./src/models/Vehicle');
const Booking = require('./src/models/Booking');

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const importData = async () => {
    try {
        console.log('Clearing existing data...');
        await User.deleteMany();
        await Vehicle.deleteMany();
        await Booking.deleteMany();

        console.log('Seeding Users...');
        // Create Admin
        let adminUser = await User.findOne({ email: 'admin@gmail.com' });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'System Admin',
                email: 'admin@gmail.com',
                password: 'admin@123',
                role: 'admin'
            });
        }

        /*
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const users = await User.insertMany([
            { name: 'John Doe', email: 'john@example.com', password: hashedPassword, role: 'user' },
            { name: 'Jane Smith', email: 'jane@example.com', password: hashedPassword, role: 'user' },
            { name: 'Mike Johnson', email: 'mike@example.com', password: hashedPassword, role: 'user' },
            { name: 'Alice Brown', email: 'alice@example.com', password: hashedPassword, role: 'user' },
            { name: 'David Lee', email: 'david@example.com', password: hashedPassword, role: 'user' }
        ]);
        */

        console.log('Seeding Vehicles...');
        const vehicles = await Vehicle.insertMany([
            {
                make: 'Toyota',
                model: 'Camry',
                type: 'car',
                licensePlate: 'KA-01-AB-1234',
                pricePerHour: 15,
                description: 'Reliable sedan for city drives.',
                images: ['https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&q=80&w=1000'],
                status: 'rented',
                currentLocation: { lat: 12.9716, lng: 77.5946 }
            },
            {
                make: 'Honda',
                model: 'Civic',
                type: 'car',
                licensePlate: 'KA-05-XY-9876',
                pricePerHour: 18,
                description: 'Sporty and comfortable.',
                images: ['https://images.unsplash.com/photo-1606164749364-2131976a44cb?auto=format&fit=crop&q=80&w=1000'],
                status: 'available',
                currentLocation: { lat: 12.9250, lng: 77.6200 }
            },
            {
                make: 'Tesla',
                model: 'Model 3',
                type: 'car',
                licensePlate: 'KA-53-EV-0001',
                pricePerHour: 40,
                description: 'Electric future.',
                images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000'],
                status: 'rented',
                currentLocation: { lat: 13.0000, lng: 77.6500 }
            },
            {
                make: 'Royal Enfield',
                model: 'Classic 350',
                type: 'bike',
                licensePlate: 'KA-03-HA-3456',
                pricePerHour: 8,
                description: 'Classic cruiser.',
                images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000'],
                status: 'available',
                currentLocation: { lat: 12.9600, lng: 77.5600 }
            }
        ]);

        /*
        console.log('Seeding Bookings...');
        await Booking.insertMany([
            {
                user: users[0]._id,
                vehicle: vehicles[0]._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 86400000), // 1 day later
                totalPrice: 360,
                status: 'active',
                paymentStatus: 'paid'
            },
            {
                user: users[1]._id,
                vehicle: vehicles[2]._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 172800000), // 2 days later
                totalPrice: 1920,
                status: 'active',
                paymentStatus: 'paid'
            },
            {
                user: users[2]._id,
                vehicle: vehicles[1]._id,
                startDate: new Date(Date.now() - 604800000), // 1 week ago
                endDate: new Date(Date.now() - 518400000), // 6 days ago
                totalPrice: 432,
                status: 'completed',
                paymentStatus: 'paid'
            },
            {
                user: users[3]._id,
                vehicle: vehicles[3]._id,
                startDate: new Date(Date.now() + 86400000), // 1 day future
                endDate: new Date(Date.now() + 172800000),
                totalPrice: 192,
                status: 'confirmed',
                paymentStatus: 'paid'
            }
        ]);
        */

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
