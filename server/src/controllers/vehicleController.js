const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const Booking = require('../models/Booking');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
exports.getVehicles = async (req, res) => {
    try {
        const { lat, lng, radius, startDate, endDate } = req.query;
        let query = {};

        if (lat && lng) {
            query.currentLocation = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: (parseInt(radius) || 50) * 1000 // default 50km
                }
            };
        }

        let vehicles = await Vehicle.find(query).lean(); // Use lean() for better performance and to allow appending properties

        // Check availability for each vehicle
        // If the user requested specific dates, filter out unavailable ones
        // If not, just mark them as unavailable IF they are currently rented

        const now = new Date();

        // Fetch active bookings for these vehicles that overlap with now or the requested range
        // For simple "currently available" check:
        const vehicleIds = vehicles.map(v => v._id);

        const activeBookings = await Booking.find({
            vehicle: { $in: vehicleIds },
            status: { $in: ['confirmed', 'active'] },
            endDate: { $gte: now }
        });

        // Map bookings to vehicles
        const vehiclesWithRenter = await Promise.all(vehicles.map(async (vehicle) => {
            const vehicleBookings = activeBookings.filter(b => b.vehicle.toString() === vehicle._id.toString());

            // Find if there is a booking intersecting with NOW
            const currentBooking = vehicleBookings.find(b => b.startDate <= now && b.endDate >= now);

            if (currentBooking) {
                // Populate user details for this booking if not already populated
                // Since we did find() above, we might need to populate user manually or do a separate query
                // Optimization: We can just use the user ID from booking if not populated, 
                // but we need the NAME.
                // Let's fetch the user name for this specific booking
                const BookingModel = require('../models/Booking');
                const fullBooking = await BookingModel.findById(currentBooking._id).populate('user', 'name');

                const nextAvailable = new Date(currentBooking.endDate);
                nextAvailable.setHours(nextAvailable.getHours() + 10); // +10 hours for cleaning

                return {
                    ...vehicle,
                    isAvailable: false,
                    nextAvailableDate: nextAvailable,
                    status: 'rented',
                    currentRenter: fullBooking?.user?.name || 'Unknown',
                    licensePlate: vehicle.licensePlate
                };
            }

            return { ...vehicle, isAvailable: true, licensePlate: vehicle.licensePlate };
        }));

        res.json(vehiclesWithRenter);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.json(vehicle);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
exports.createVehicle = async (req, res) => {
    try {
        const { make, model, type, licensePlate, pricePerHour, description, currentLocation } = req.body;

        // Handle Image Uploads
        let images = [];
        if (req.files) {
            req.files.forEach(file => {
                images.push(`${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
            });
        }

        const newVehicle = new Vehicle({
            make,
            model,
            type,
            licensePlate,
            pricePerHour,
            description,
            currentLocation: currentLocation ? JSON.parse(currentLocation) : undefined, // Parse if sent as string
            images
        });

        const vehicle = await newVehicle.save();
        res.json(vehicle);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
exports.updateVehicle = async (req, res) => {
    try {
        let vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Handle Image Uploads
        let images = vehicle.images; // Default to existing images
        if (req.files && req.files.length > 0) {
            images = []; // Replace with new images (or append logic if preferred)
            req.files.forEach(file => {
                images.push(`${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
            });
        }

        const { make, model, type, licensePlate, pricePerHour, description, currentLocation } = req.body;

        const updateData = {
            make,
            model,
            type,
            licensePlate,
            pricePerHour,
            description,
            images,
            currentLocation: currentLocation ? (typeof currentLocation === 'string' ? JSON.parse(currentLocation) : currentLocation) : vehicle.currentLocation
        };

        vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(vehicle);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        await vehicle.deleteOne();

        res.json({ message: 'Vehicle removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update vehicle location (GPS Integration)
// @route   POST /api/vehicles/:id/location
// @access  Public (or Protected with API Key)
exports.updateVehicleLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            {
                currentLocation: {
                    type: 'Point',
                    coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
                }
            },
            { new: true }
        );

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            io.emit('vehicle_location_updated', {
                vehicleId: vehicle._id,
                lat,
                lng
            });
        }

        res.json(vehicle);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
