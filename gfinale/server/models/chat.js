const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: Number,
  type: String,
  content: String
});

const chatSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    messages: [messageSchema],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('chats', chatSchema);