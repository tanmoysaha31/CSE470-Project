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
        
        // Ensure budget is provided
        if (req.body.budget === undefined || req.body.budget === null || req.body.budget === '') {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: 'Budget is required' 
            });
        }
        
        // Validate budget against income
        if (req.body.budget > finance.income) {
            return res.status(400).json({ 
                error: 'Budget validation failed', 
                details: 'Budget cannot exceed total income' 
            });
        }
        
        // Calculate total budgets to ensure we're not exceeding income
        const totalBudget = finance.expenses.reduce((sum, expense) => sum + (expense.budget || 0), 0) + parseFloat(req.body.budget);
        
        if (totalBudget > finance.income) {
            return res.status(400).json({ 
                error: 'Budget validation failed', 
                details: 'Total budgets cannot exceed income. Please adjust your budget allocations.' 
            });
        }
        
        finance.expenses.push({
            name: req.body.name,
            amount: parseFloat(req.body.amount),
            budget: parseFloat(req.body.budget),
            category: req.body.category
        });
        
        await finance.save();
        
        res.json(finance);
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ 
            error: 'Error adding expense', 
            details: error.message 
        });
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

        const { name, amount, category, budget } = req.body;
        
        // Basic validation
        if (!name || typeof amount !== 'number') {
            return res.status(400).json({ error: 'Invalid expense data. Name and amount are required.' });
        }
        
        // Handle budget validation
        if (budget === undefined || budget === null) {
            return res.status(400).json({ error: 'Invalid expense data. Budget is required.' });
        }
        
        const budgetValue = parseFloat(budget);
        if (isNaN(budgetValue) || budgetValue < 0) {
            return res.status(400).json({ error: 'Invalid expense data. Budget must be a positive number.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // First get the finance data to check budgets
        const financeData = await Finance.findOne({ userId: decoded.id });
        
        if (!financeData) {
            return res.status(404).json({ error: 'Finance data not found' });
        }
        
        // Find the current expense to get its current budget
        const currentExpense = financeData.expenses.find(exp => exp._id.toString() === req.params.expenseId);
        
        if (!currentExpense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        // Calculate the difference in budget
        const budgetDifference = budgetValue - (currentExpense.budget || 0);
        
        // Calculate total budgets including the change
        const totalBudget = financeData.expenses.reduce((sum, expense) => {
            // Skip the current expense as we're calculating its change separately
            if (expense._id.toString() === req.params.expenseId) {
                return sum;
            }
            return sum + (expense.budget || 0);
        }, 0) + budgetValue;
        
        // Validate new budget total against income
        if (totalBudget > financeData.income) {
            return res.status(400).json({ 
                error: 'Budget validation failed', 
                details: 'Total budgets cannot exceed income. Please adjust your budget allocations.' 
            });
        }
        
        // Now update the expense
        const finance = await Finance.findOneAndUpdate(
            {
                userId: decoded.id,
                'expenses._id': req.params.expenseId
            },
            {
                $set: {
                    'expenses.$.name': name,
                    'expenses.$.amount': amount,
                    'expenses.$.budget': budgetValue,
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
        res.status(500).json({ 
            error: 'Error updating expense',
            details: error.message
        });
    }
};

// Get budget summary
exports.getBudgetSummary = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const finance = await Finance.findOne({ userId: decoded.id });
        
        if (!finance) {
            return res.status(404).json({ error: 'Finance data not found' });
        }
        
        // Calculate budget and spending by category
        const categories = {};
        let totalBudget = 0;
        let totalSpent = 0;
        
        finance.expenses.forEach(expense => {
            const category = expense.category || 'Other';
            
            if (!categories[category]) {
                categories[category] = {
                    budget: 0,
                    spent: 0
                };
            }
            
            categories[category].budget += expense.budget || 0;
            categories[category].spent += expense.amount || 0;
            
            totalBudget += expense.budget || 0;
            totalSpent += expense.amount || 0;
        });
        
        const summary = {
            categories: Object.entries(categories).map(([name, data]) => ({
                name,
                budget: data.budget,
                spent: data.spent,
                remaining: data.budget - data.spent,
                percentage: data.budget > 0 ? Math.round((data.spent / data.budget) * 100) : 0
            })),
            totalBudget,
            totalSpent,
            remaining: totalBudget - totalSpent,
            percentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
            income: finance.income
        };
        
        res.json(summary);
    } catch (error) {
        console.error('Budget summary error:', error);
        res.status(500).json({ error: 'Error getting budget summary' });
    }
};

// Update budget
exports.updateBudget = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        // Validate budget input
        const budget = parseFloat(req.body.budget);
        if (isNaN(budget) || budget < 0) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: 'Budget must be a positive number' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const finance = await Finance.findOneAndUpdate(
            { userId: decoded.id },
            { budget: budget },
            { new: true, upsert: true }
        );

        res.json(finance);
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({ 
            error: 'Error updating budget',
            details: error.message
        });
    }
};