const express = require('express');
const router = express.Router();
const { getMessages, getChatList, getAdmin } = require('../controllers/chatController');
const { protect, admin } = require('../middleware/auth');

router.get('/admin', protect, getAdmin);
router.get('/list', protect, admin, getChatList);
router.get('/:userId', protect, getMessages);

module.exports = router;
