const express = require('express');
const { chatbotResponse, getChatHistory, clearChatHistory, getUserConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Chat endpoint (protected)
router.post('/chat', protect, chatbotResponse);

// Get user conversations (protected)
router.get('/conversations', protect, getUserConversations);

// Get chat history (protected)
router.get('/chat/history', protect, getChatHistory);

// Clear chat history (protected)
router.delete('/chat/history', protect, async (req, res) => {
    try {
        await Chat.findOneAndUpdate(
            { user: req.user.id },
            { $set: { history: [] } },
            { upsert: true }
        );
        res.json({ message: 'Chat history cleared' });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
