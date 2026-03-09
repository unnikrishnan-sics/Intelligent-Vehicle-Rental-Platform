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
        let pipeline = [];

        if (lat && lng) {
            pipeline.push({
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    distanceField: 'distance',
                    spherical: true,
                    // If radius is provided, we can still filter, but the prompt says 
                    // "Show nearby first... then far away", which implies showing all.
                    // We'll use radius * 1000 if provided, otherwise no limit to show all.
                    maxDistance: radius ? parseInt(radius) * 1000 : 20000000 // default to very large if not filtering
                }
            });
            // Add a flag for nearby (within 50km)
            pipeline.push({
                $addFields: {
                    isNearby: { $lte: ["$distance", 50000] }
                }
            });
            // Sort by isNearby desc (true first), then by distance asc
            pipeline.push({
                $sort: { isNearby: -1, distance: 1 }
            });
        }

        let vehicles = await Vehicle.aggregate(pipeline.length > 0 ? pipeline : [{ $match: {} }]);

        const now = new Date();
        const vehicleIds = vehicles.map(v => v._id);

        const activeBookings = await Booking.find({
            vehicle: { $in: vehicleIds },
            status: { $in: ['confirmed', 'active'] },
            endDate: { $gte: now }
        });

        const vehiclesWithRenter = await Promise.all(vehicles.map(async (vehicle) => {
            const vehicleBookings = activeBookings.filter(b => b.vehicle.toString() === vehicle._id.toString());
            const currentBooking = vehicleBookings.find(b => b.startDate <= now && b.endDate >= now);

            if (currentBooking) {
                const BookingModel = require('../models/Booking');
                const fullBooking = await BookingModel.findById(currentBooking._id).populate('user', 'name');

                const nextAvailable = new Date(currentBooking.endDate);
                nextAvailable.setHours(nextAvailable.getHours() + 10);

                return {
                    ...vehicle,
                    isAvailable: false,
                    nextAvailableDate: nextAvailable,
                    status: 'rented',
                    currentRenter: fullBooking?.user?.name || 'Unknown',
                    distanceKm: (vehicle.distance !== undefined && vehicle.distance !== null) ? (vehicle.distance / 1000).toFixed(1) : null
                };
            }

            return {
                ...vehicle,
                isAvailable: vehicle.status === 'available',
                distanceKm: (vehicle.distance !== undefined && vehicle.distance !== null) ? (vehicle.distance / 1000).toFixed(1) : null
            };
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
                images.push(`/uploads/${file.filename}`);
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
                images.push(`/uploads/${file.filename}`);
            });
        }

        const { make, model, type, licensePlate, pricePerHour, description, currentLocation, status } = req.body;

        const updateData = {
            description,
            images,
            currentLocation: currentLocation ? (typeof currentLocation === 'string' ? JSON.parse(currentLocation) : currentLocation) : vehicle.currentLocation
        };

        // Only update fields if they are provided (Partial Update Support)
        if (make) updateData.make = make;
        if (model) updateData.model = model;
        if (type) updateData.type = type;
        if (licensePlate) updateData.licensePlate = licensePlate;
        if (pricePerHour) updateData.pricePerHour = pricePerHour;
        if (status) updateData.status = status;

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
