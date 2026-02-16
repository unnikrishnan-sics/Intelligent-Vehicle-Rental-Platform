const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user', protect, authController.getMe);

router.get('/users', protect, admin, authController.getAllUsers);
router.delete('/users/:id', protect, admin, authController.deleteUser);

module.exports = router;
