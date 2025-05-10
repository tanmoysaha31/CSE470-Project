const express = require('express');
const router = express.Router();
const cors = require('cors');
const { test, registerUser, loginUser, getProfile, updateProfile } = require('../controllers/authController');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { generateResponse } = require('../controllers/aiController');
const { createChat, getChats, getChat, updateChat, deleteChat } = require('../controllers/chatController');

//middleware
router.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type']
    })
);

router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)
router.put('/update-profile', updateProfile)

router.post('/tasks', createTask);
router.get('/tasks', getTasks);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

router.post('/ai/generate', generateResponse);

router.post('/chats', createChat);
router.get('/chats', getChats);
router.get('/chats/:id', getChat);
router.put('/chats/:id', updateChat);
router.delete('/chats/:id', deleteChat);

module.exports = router