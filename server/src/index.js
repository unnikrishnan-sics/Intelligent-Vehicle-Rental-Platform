const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/adminSeeder');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
    seedAdmin();
});

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for dev
        methods: ['GET', 'POST']
    }
});

// Make io accessible to our routers
app.set('io', io);

// Real-time connection handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_vehicle_room', (vehicleId) => {
        socket.join(vehicleId);
    });

    socket.on('update_location', async (data) => {
        // Broadcast to all connected clients (Admin & Users)
        io.emit('vehicle_location_updated', data);

        // Persist location to database
        try {
            const Vehicle = require('./models/Vehicle');
            await Vehicle.findByIdAndUpdate(data.vehicleId, {
                currentLocation: {
                    type: 'Point',
                    coordinates: [data.lng, data.lat] // GeoJSON: [longitude, latitude]
                }
            });
            // console.log(`Persisted location for ${data.vehicleId}`);
        } catch (err) {
            console.error('Error updating vehicle location:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Basic Route
app.get('/', (req, res) => {
    res.send('Vehicle Rental Platform API is Running');
});

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
