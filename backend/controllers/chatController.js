const User = require('../models/userModel');
const { generateDisprovenFacts } = require('../services/service');

const chatbotResponse = async (req, res) => {
    const { userQuery } = req.body;

    if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
        return res.status(400).json({ message: 'Please provide a valid query' });
    }

    try {
        // Get user's recent chat history
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get last 5 messages for context
        const recentMessages = user.chatHistory.slice(-5).map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
        }));

        // Add current query
        recentMessages.push({ role: 'user', content: userQuery });

        // Generate response with context
        const botResponse = await generateDisprovenFacts(userQuery, recentMessages);

        // Create message objects
        const userMessage = {
            text: userQuery,
            isUser: true,
            timestamp: new Date()
        };

        const botMessage = {
            text: botResponse.cleanedFacts,
            isUser: false,
            audioUrl: botResponse.ttsUrls && botResponse.ttsUrls.length > 0 ? botResponse.ttsUrls[0].url : null,
            timestamp: new Date()
        };

        // Add messages to user's chat history
        user.chatHistory.push(userMessage, botMessage);
        await user.save();

        res.json({ 
            success: true,
            response: botResponse 
        });
    } catch (error) {
        console.error('Error in chatbot controller:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Failed to fetch response.' 
        });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the complete chat history
        res.json({ 
            success: true,
            history: user.chatHistory 
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch chat history' 
        });
    }
};

const clearChatHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.chatHistory = [];
        await user.save();
        res.json({ message: 'Chat history cleared successfully' });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ message: 'Failed to clear chat history' });
    }
};

// Get user conversations
const getUserConversations = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ conversations: user.chatHistory });
    } catch (error) {
        console.error('Error fetching user conversations:', error);
        res.status(500).json({ message: 'Failed to fetch conversations.' });
    }
};

module.exports = { chatbotResponse, getChatHistory, clearChatHistory, getUserConversations };
