const express = require('express');
const router = express.Router();
const { generateResponse, summarizeNote } = require('../controllers/aiController');
const { requireSignIn } = require('../middleware/authMiddleware');

// Route for generating AI responses (POST method for traditional requests)
router.post('/api/ai/generate', requireSignIn, generateResponse);

// Route for summarizing notes
router.post('/api/ai/summarize-note', requireSignIn, summarizeNote);

module.exports = router; 