const express = require('express');
const { chatbotResponse, getChatHistory, clearChatHistory, getUserConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Chat endpoint (protected)
router.post('/', protect, chatbotResponse);

// Get user conversations (protected)
router.get('/conversations', protect, getUserConversations);

// Get chat history (protected)
router.get('/history', protect, getChatHistory);

// Clear chat history (protected)
router.post('/clear', protect, clearChatHistory);

module.exports = router;
