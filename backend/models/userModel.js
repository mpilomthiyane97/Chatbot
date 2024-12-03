const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    isUser: {
        type: Boolean,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    audioUrl: {
        type: String,
        default: null
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    chatHistory: {
        type: [messageSchema],
        default: []
    }
});

// Hash password before saving user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Check if the model exists before compiling it
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
