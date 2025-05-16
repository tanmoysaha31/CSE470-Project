const mongoose = require('mongoose');
const { Schema } = mongoose;

const noteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Untitled Note',
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    fontFamily: {
        type: String,
        default: 'Arial'
    },
    fontSize: {
        type: Number,
        default: 14
    }
}, {
    timestamps: true
});

const Note = mongoose.model('Note', noteSchema);
module.exports = Note; 