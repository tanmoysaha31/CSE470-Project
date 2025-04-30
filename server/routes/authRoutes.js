const express = require('express');
const router = express.Router();
const cors = require('cors');
const { test, registerUser, loginUser, getProfile, updateProfile } = require('../controllers/authController');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');

//middleware
router.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }),
)

router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)
router.put('/update-profile', updateProfile)

router.post('/tasks', createTask);
router.get('/tasks', getTasks);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

module.exports = router