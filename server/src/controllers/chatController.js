const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get conversation history between two users
// @route   GET /api/chat/:userId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user._id }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get list of users who have chatted with admin (for Admin view)
// @route   GET /api/chat/list
// @access  Private/Admin
exports.getChatList = async (req, res) => {
    try {
        // Find all messages involving the current user (Admin)
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        }).sort({ timestamp: -1 });

        const userIds = new Set();
        messages.forEach(msg => {
            const otherUser = msg.sender.toString() === req.user._id.toString()
                ? msg.receiver.toString()
                : msg.sender.toString();
            userIds.add(otherUser);
        });

        const users = await User.find({
            _id: { $in: Array.from(userIds) },
            role: { $ne: 'admin' } // Only show customers/drivers to admin
        }).select('name email');

        // Add last message info to each user
        const chatList = users.map(user => {
            const lastMsg = messages.find(m =>
                m.sender.toString() === user._id.toString() ||
                m.receiver.toString() === user._id.toString()
            );
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                lastMessage: lastMsg ? lastMsg.message : '',
                lastTimestamp: lastMsg ? lastMsg.timestamp : null
            };
        });

        // Sort by last message timestamp
        chatList.sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));

        res.json(chatList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get Admin info for support chat
// @route   GET /api/chat/admin
// @access  Private
exports.getAdmin = async (req, res) => {
    try {
        const admin = await User.findOne({ role: 'admin' }).select('name _id');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
