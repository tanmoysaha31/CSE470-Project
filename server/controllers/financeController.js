const Finance = require('../models/Finance');
const jwt = require('jsonwebtoken');

// Get finance data
exports.getFinance = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const finance = await Finance.findOne({ userId: decoded.id });

        if (!finance) {
            const newFinance = await Finance.create({ userId: decoded.id });
            return res.json(newFinance);
        }

        res.json(finance);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching finance data' });
    }
};

// Update income
exports.updateIncome = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const finance = await Finance.findOneAndUpdate(
            { userId: decoded.id },
            { income: req.body.income },
            { new: true, upsert: true }
        );

        res.json(finance);
    } catch (error) {
        res.status(500).json({ error: 'Error updating income' });
    }
};

// Add expense
exports.addExpense = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const finance = await Finance.findOne({ userId: decoded.id });
        
        finance.expenses.push(req.body);
        await finance.save();
        
        res.json(finance);
    } catch (error) {
        res.status(500).json({ error: 'Error adding expense' });
    }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const finance = await Finance.findOneAndUpdate(
            { userId: decoded.id },
            { $pull: { expenses: { _id: req.params.expenseId } } },
            { new: true }
        );

        res.json(finance);
    } catch (error) {
        res.status(500).json({ error: 'Error deleting expense' });
    }
};

// Update expense
exports.updateExpense = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name, amount, category } = req.body;
        if (!name || typeof amount !== 'number') {
            return res.status(400).json({ error: 'Invalid expense data' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const finance = await Finance.findOneAndUpdate(
            {
                userId: decoded.id,
                'expenses._id': req.params.expenseId
            },
            {
                $set: {
                    'expenses.$.name': name,
                    'expenses.$.amount': amount,
                    'expenses.$.category': category || 'Other'
                }
            },
            { new: true }
        );

        if (!finance) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json(finance);
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ error: 'Error updating expense' });
    }
};