const express = require('express');
const router = express.Router();
const { addFinance, getFinanceByDate, getMonthlySummary } = require('../controllers/financeController');
const auth = require('../helpers/auth'); // Authentication middleware

router.post('/add', auth, addFinance);
router.get('/date', auth, getFinanceByDate);
router.get('/summary', auth, getMonthlySummary);

module.exports = router;