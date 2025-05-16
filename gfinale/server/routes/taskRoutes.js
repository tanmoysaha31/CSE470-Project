const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { requireSignIn } = require('../middleware/authMiddleware');

// Task routes
router.post('/tasks', requireSignIn, createTask);
router.get('/tasks', requireSignIn, getTasks);
router.put('/tasks/:id', requireSignIn, updateTask);
router.delete('/tasks/:id', requireSignIn, deleteTask);

module.exports = router; 