const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    id: Number,
    type: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

const chatSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    messages: [messageSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add a pre-save middleware to update lastUpdated
chatSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;