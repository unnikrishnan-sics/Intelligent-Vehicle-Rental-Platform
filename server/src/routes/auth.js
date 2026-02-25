const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user', protect, authController.getMe);
router.put('/updatedetails', protect, upload.single('licenseImage'), authController.updateDetails);

router.get('/users', protect, admin, authController.getAllUsers);
router.delete('/users/:id', protect, admin, authController.deleteUser);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resettoken', authController.resetPassword);

module.exports = router;
