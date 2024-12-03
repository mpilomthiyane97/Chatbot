const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

// Register User
const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Please provide both username and password' 
            });
        }

        // Validate username length
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ 
                message: 'Username must be between 3 and 20 characters' 
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ 
                message: 'Username is already taken' 
            });
        }

        // Create user
        const user = await User.create({
            username,
            password,
            chatHistory: [] // Initialize empty chat history
        });

        if (user) {
            res.status(201).json({
                message: 'Registration successful',
                user: {
                    _id: user._id,
                    username: user.username
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ 
                message: 'Invalid user data' 
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Please provide both username and password' 
            });
        }

        // Find user and check password
        const user = await User.findOne({ username });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ 
                message: 'Invalid username or password' 
            });
        }

        // Send successful response
        res.json({
            message: 'Login successful',
            user: {
                _id: user._id,
                username: user.username
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { registerUser, loginUser };
