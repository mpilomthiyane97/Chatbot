const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userQuery: {
        type: String,
        required: true
    },
    botResponse: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference the user who made the query
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
