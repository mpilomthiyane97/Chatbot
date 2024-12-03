const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Get the User model
const User = require('../models/userModel');

async function updateUsers() {
    try {
        // Find all users that don't have chatHistory
        const users = await User.find({ chatHistory: { $exists: false } });
        console.log(`Found ${users.length} users to update`);

        // Update each user
        for (const user of users) {
            user.chatHistory = [];
            await user.save();
            console.log(`Updated user: ${user.username}`);
        }

        console.log('All users updated successfully');
    } catch (error) {
        console.error('Error updating users:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the update
updateUsers();
