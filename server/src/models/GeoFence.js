const mongoose = require('mongoose');

const GeoFenceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    coordinates: {
        type: { type: String, enum: ['Polygon'], default: 'Polygon' },
        coordinates: [[[Number]]] // Array of [lng, lat] arrays
    },
    description: { type: String },
    isActive: { type: Boolean, default: true }
});

// Index for geospatial queries
GeoFenceSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('GeoFence', GeoFenceSchema);
