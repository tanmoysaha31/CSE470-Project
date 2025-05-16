const express = require('express');
const router = express.Router();
const cors = require('cors');
const { test, registerUser, loginUser, getProfile, updateProfile } = require('../controllers/authController');
const { generateResponse } = require('../controllers/aiController');
const { createChat, getChats, getChat, updateChat, deleteChat } = require('../controllers/chatController');
const upload = require('../middleware/uploadMiddleware');
const { uploadProfilePicture, deleteProfilePicture } = require('../controllers/uploadController');
const financeController = require('../controllers/financeController');
const { requireSignIn } = require('../middleware/authMiddleware');

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
router.get('/profile', requireSignIn, getProfile)
router.put('/update-profile', requireSignIn, updateProfile)

router.post('/ai/generate', requireSignIn, generateResponse);

router.post('/chats', requireSignIn, createChat);
router.get('/chats', requireSignIn, getChats);
router.get('/chats/:id', requireSignIn, getChat);
router.put('/chats/:id', requireSignIn, updateChat);
router.delete('/chats/:id', requireSignIn, deleteChat);

router.post('/upload-profile-picture', requireSignIn, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/delete-profile-picture', requireSignIn, deleteProfilePicture);

// Add this route
router.post('/logout', (req, res) => {
    res.clearCookie('token').json({ message: 'Logged out successfully' });
});

router.get('/finance', requireSignIn, financeController.getFinance);
router.put('/finance/income', requireSignIn, financeController.updateIncome);
router.put('/finance/budget', requireSignIn, financeController.updateBudget);
router.post('/finance/expense', requireSignIn, financeController.addExpense);
router.delete('/finance/expense/:expenseId', requireSignIn, financeController.deleteExpense);
router.put('/finance/expense/:expenseId', requireSignIn, financeController.updateExpense);
router.get('/finance/budget', requireSignIn, financeController.getBudgetSummary);

module.exports = router