const Note = require('../models/note');

// Get all notes for a user
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get a single note by ID
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new note
const createNote = async (req, res) => {
    try {
        const newNote = new Note({
            userId: req.user._id,
            title: req.body.title || 'Untitled Note',
            content: req.body.content || '',
            fontFamily: req.body.fontFamily || 'Arial',
            fontSize: req.body.fontSize || 14
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update an existing note
const updateNote = async (req, res) => {
    try {
        const { title, content, fontFamily, fontSize } = req.body;
        const updatedNote = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { 
                title, 
                content, 
                fontFamily, 
                fontSize 
            },
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(updatedNote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    try {
        const deletedNote = await Note.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user._id 
        });

        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
}; 