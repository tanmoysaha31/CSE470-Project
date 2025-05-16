const express = require('express');
const router = express.Router();
const { requireSignIn } = require('../middleware/authMiddleware');
const {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
} = require('../controllers/noteController');

// Get all notes for the current user
router.get('/notes', requireSignIn, getNotes);

// Get a single note by ID
router.get('/notes/:id', requireSignIn, getNoteById);

// Create a new note
router.post('/notes', requireSignIn, createNote);

// Update a note
router.put('/notes/:id', requireSignIn, updateNote);

// Delete a note
router.delete('/notes/:id', requireSignIn, deleteNote);

module.exports = router; 