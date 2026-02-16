const express = require('express');
const router = express.Router();
const {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehicleLocation
} = require('../controllers/vehicleController');
const { protect, admin } = require('../middleware/auth');

const upload = require('../middleware/uploadMiddleware');

router.get('/', getVehicles);
router.get('/:id', getVehicle);
// Support up to 5 images
router.post('/', protect, admin, upload.array('images', 5), createVehicle);
router.put('/:id', protect, admin, upload.array('images', 5), updateVehicle);
router.delete('/:id', protect, admin, deleteVehicle);

// GPS Integration Route
router.post('/:id/location', updateVehicleLocation);

module.exports = router;
