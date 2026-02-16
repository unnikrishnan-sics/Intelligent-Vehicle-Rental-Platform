const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    type: { type: String, enum: ['car', 'bike', 'scooter'], required: true },
    licensePlate: { type: String, required: true, unique: true },
    pricePerHour: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }],
    status: {
        type: String,
        enum: ['available', 'rented', 'maintenance'],
        default: 'available'
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [lng, lat]
            default: [0, 0]
        }
    },
    geoFenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'GeoFence' },
    createdAt: { type: Date, default: Date.now }
});

VehicleSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Vehicle', VehicleSchema);
