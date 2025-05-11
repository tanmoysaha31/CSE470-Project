// routes/api/expenses.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Expense = require('../../models/Expense');

// @route   POST api/expenses
// @desc    Create an expense
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    const newExpense = new Expense({
      user: req.user.id,
      amount,
      category,
      description,
      date: date || Date.now()
    });

    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/expenses
// @desc    Get all expenses for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/expenses/monthly/:year/:month
// @desc    Get expenses for a specific month
// @access  Private
router.get('/monthly/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Create start and end date for the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);
    
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    
    // Check if the expense belongs to the user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    const { amount, category, description, date } = req.body;
    
    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: { amount, category, description, date } },
      { new: true }
    );
    
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    
    // Check if the expense belongs to the user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await Expense.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Expense removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

// routes/api/incomes.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Income = require('../../models/Income');

// @route   POST api/incomes
// @desc    Create an income entry
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { amount, source, description, date, isRecurring, frequency } = req.body;

    const newIncome = new Income({
      user: req.user.id,
      amount,
      source,
      description,
      date: date || Date.now(),
      isRecurring,
      frequency
    });

    const income = await newIncome.save();
    res.json(income);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/incomes
// @desc    Get all income entries for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/incomes/monthly/:year/:month
// @desc    Get income entries for a specific month
// @access  Private
router.get('/monthly/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Create start and end date for the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const incomes = await Income.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    res.json(incomes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/incomes/:id
// @desc    Update an income entry
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let income = await Income.findById(req.params.id);
    
    if (!income) return res.status(404).json({ msg: 'Income not found' });
    
    // Check if the income belongs to the user
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    const { amount, source, description, date, isRecurring, frequency } = req.body;
    
    income = await Income.findByIdAndUpdate(
      req.params.id,
      { $set: { amount, source, description, date, isRecurring, frequency } },
      { new: true }
    );
    
    res.json(income);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/incomes/:id
// @desc    Delete an income entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) return res.status(404).json({ msg: 'Income not found' });
    
    // Check if the income belongs to the user
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await Income.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Income removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/incomes/summary/:year/:month
// @desc    Get monthly summary of finances
// @access  Private
router.get('/summary/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Create start and end date for the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Get all expenses for the month
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Get all incomes for the month
    const incomes = await Income.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    
    // Calculate total income
    const totalIncome = incomes.reduce((acc, income) => acc + income.amount, 0);
    
    // Calculate balance
    const balance = totalIncome - totalExpenses;
    
    // Group expenses by category
    const expensesByCategory = {};
    expenses.forEach(expense => {
      if (expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] += expense.amount;
      } else {
        expensesByCategory[expense.category] = expense.amount;
      }
    });
    
    // Generate daily expense data
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyExpenses = Array(daysInMonth).fill(0);
    
    expenses.forEach(expense => {
      const day = new Date(expense.date).getDate() - 1; // Arrays are 0-indexed
      dailyExpenses[day] += expense.amount;
    });
    
    res.json({
      totalExpenses,
      totalIncome,
      balance,
      expensesByCategory,
      dailyExpenses
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;