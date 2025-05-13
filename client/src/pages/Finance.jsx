import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../assets/styles/finance.css';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LabelList
} from 'recharts';

export default function Finance() {
    const [finance, setFinance] = useState({ income: 0, expenses: [] });
    const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Other' });
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState({ name: '', amount: '', category: 'Other' });
    const [thresholds, setThresholds] = useState({
        green: 50,
        orange: 70,
        red: 90
    });
    
    // Categories for expenses
    const categories = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Other'];
    
    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#f47560', '#ffc658'];

    // Reset scroll position and ensure proper layout when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Force layout recalculation to ensure proper sticky positioning
        const resizeEvent = window.document.createEvent('UIEvents');
        resizeEvent.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(resizeEvent);
        
        return () => {
            // Clean up any potential side effects when component unmounts
        };
    }, []);

    // Add this useEffect to load saved thresholds
    useEffect(() => {
        const savedThresholds = localStorage.getItem('financeThresholds');
        if (savedThresholds) {
            setThresholds(JSON.parse(savedThresholds));
        }
    }, []);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        try {
            const { data } = await axios.get('/finance', { withCredentials: true });
            setFinance(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch finance data');
            setLoading(false);
        }
    };

    const updateIncome = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put('/finance/income', {
                income: finance.income
            }, { withCredentials: true });
            setFinance(data);
            toast.success('Income updated');
        } catch (error) {
            toast.error('Failed to update income');
        }
    };

    const addExpense = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/finance/expense', newExpense, {
                withCredentials: true
            });
            setFinance(data);
            setNewExpense({ name: '', amount: '', category: 'Other' });
            toast.success('Expense added');
        } catch (error) {
            toast.error('Failed to add expense');
        }
    };

    const updateExpense = async (expenseId) => {
        try {
            // Validate input
            if (!editValue.name.trim()) {
                toast.error('Name is required');
                return;
            }

            const amount = parseFloat(editValue.amount);
            if (isNaN(amount) || amount <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }

            console.log('Sending update request:', {
                expenseId,
                name: editValue.name.trim(),
                amount: amount,
                category: editValue.category
            });

            const { data } = await axios.put(`/finance/expense/${expenseId}`, {
                name: editValue.name.trim(),
                amount: amount,
                category: editValue.category
            }, {
                withCredentials: true
            });

            if (data) {
                setFinance(data);
                setEditingId(null);
                setEditValue({ name: '', amount: '', category: 'Other' });
                toast.success('Expense updated successfully');
            }
        } catch (error) {
            console.error('Update error details:', error.response?.data || error.message);
            toast.error('Failed to update expense. Please try again.');
        }
    };

    const deleteExpense = async (expenseId) => {
        try {
            const { data } = await axios.delete(`/finance/expense/${expenseId}`, {
                withCredentials: true
            });
            setFinance(data);
            toast.success('Expense deleted');
        } catch (error) {
            toast.error('Failed to delete expense');
        }
    };

    const startEditing = (expense) => {
        setEditingId(expense._id);
        setEditValue({ 
            name: expense.name, 
            amount: expense.amount,
            category: expense.category || 'Other'
        });
    };

    const calculateTotal = () => {
        return finance.expenses.reduce((total, expense) => total + expense.amount, 0);
    };

    const calculateStatus = () => {
        if (!finance.income) return { status: 'neutral', color: 'var(--text-primary)' };
        
        const expensePercentage = (calculateTotal() / finance.income) * 100;
        
        if (expensePercentage <= thresholds.green) {
            return { status: 'Good', color: '#4CAF50' };
        } else if (expensePercentage <= thresholds.orange) {
            return { status: 'Warning', color: '#FFA500' };
        } else if (expensePercentage <= thresholds.red) {
            return { status: 'Critical', color: '#FF4444' };
        } else {
            return { status: 'Exceeded', color: '#831010' };
        }
    };

    // Prepare data for charts
    const getCategoryData = () => {
        const categoryTotals = {};
        
        categories.forEach(category => {
            categoryTotals[category] = 0;
        });
        
        finance.expenses.forEach(expense => {
            const category = expense.category || 'Other';
            categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
        });
        
        return categories.map(category => ({
            name: category,
            value: categoryTotals[category],
            percentage: finance.income > 0 
                ? ((categoryTotals[category] / finance.income) * 100).toFixed(1) 
                : 0
        }));
    };
    
    const getPieChartData = () => {
        return getCategoryData().filter(item => item.value > 0);
    };
    
    const getBarChartData = () => {
        return getCategoryData();
    };
    
    const getBudgetProgressData = () => {
        const categoryData = getCategoryData();
        
        // Calculate the percentage of income for each category
        return categoryData.map(item => ({
            ...item,
            fill: item.percentage <= thresholds.green 
                ? '#4CAF50' 
                : item.percentage <= thresholds.orange 
                    ? '#FFA500' 
                    : item.percentage <= thresholds.red 
                        ? '#FF4444' 
                        : '#831010'
        }));
    };

    // Add this function to handle threshold updates
    const updateThresholds = (type, value) => {
        const newValue = Math.min(100, Math.max(0, Number(value)));
        const newThresholds = { ...thresholds };

        // Ensure thresholds maintain proper order
        switch (type) {
            case 'green':
                newThresholds.green = Math.min(newValue, thresholds.orange);
                break;
            case 'orange':
                newThresholds.orange = Math.max(Math.min(newValue, thresholds.red), thresholds.green);
                break;
            case 'red':
                newThresholds.red = Math.max(newValue, thresholds.orange);
                break;
        }

        setThresholds(newThresholds);
        localStorage.setItem('financeThresholds', JSON.stringify(newThresholds));
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="finance-container">
            <div className="income-section">
                <form onSubmit={updateIncome} className="income-form">
                    <label>Monthly Income</label>
                    <input
                        type="number"
                        value={finance.income}
                        onChange={(e) => setFinance({ ...finance, income: Number(e.target.value) })}
                        placeholder="Enter your income"
                    />
                    <button type="submit">Update Income</button>
                </form>
            </div>

            <div className="finance-charts">
                <div className="chart-container">
                    <h3>Budget Progress by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            layout="vertical"
                            data={getBudgetProgressData()}
                            margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} unit="%" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip 
                                formatter={(value) => [`${value}%`, 'Budget Used']}
                                labelFormatter={(label) => `Category: ${label}`}
                            />
                            <Legend />
                            <Bar 
                                dataKey="percentage" 
                                name="Budget Used" 
                                barSize={20}
                                fill="#8884d8"
                                radius={[0, 10, 10, 0]}
                            >
                                {getBudgetProgressData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                                <LabelList dataKey="percentage" position="right" formatter={(value) => `${value}%`} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="chart-container">
                    <h3>Expense Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={getPieChartData()}
                                cx="50%"
                                cy="50%"
                                labelLine
                                label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {getPieChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="chart-container">
                    <h3>Category Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={getBarChartData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="value" name="Amount" fill="#8884d8">
                                {getBarChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="expenses-list">
                {finance.expenses.map((expense) => (
                    <div key={expense._id} className="expense-item">
                        {editingId === expense._id ? (
                            <div className="expense-edit">
                                <div className="form-field">
                                    <label htmlFor="edit-name">Name</label>
                                    <input
                                        id="edit-name"
                                        type="text"
                                        value={editValue.name}
                                        onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                                        placeholder="Expense name"
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <label htmlFor="edit-amount">Amount</label>
                                    <input
                                        id="edit-amount"
                                        type="number"
                                        value={editValue.amount}
                                        onChange={(e) => setEditValue({ 
                                            ...editValue, 
                                            amount: e.target.value ? parseFloat(e.target.value) : ''
                                        })}
                                        placeholder="Amount"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <label htmlFor="edit-category">Category</label>
                                    <select
                                        id="edit-category"
                                        value={editValue.category || 'Other'}
                                        onChange={(e) => setEditValue({
                                            ...editValue,
                                            category: e.target.value
                                        })}
                                    >
                                        {categories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="edit-buttons">
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            updateExpense(expense._id);
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setEditingId(null);
                                            setEditValue({ name: '', amount: '', category: 'Other' });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="expense-info">
                                <span 
                                    className="expense-name editable" 
                                    onClick={() => startEditing(expense)}
                                >
                                    {expense.name}
                                </span>
                                <span className="expense-category">
                                    {expense.category || 'Other'}
                                </span>
                                <span 
                                    className="expense-amount editable"
                                    onClick={() => startEditing(expense)}
                                >
                                    ${expense.amount.toFixed(2)}
                                </span>
                                <button 
                                    className="delete-btn"
                                    onClick={() => deleteExpense(expense._id)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="add-expense-section">
                <h3>Add New Expense</h3>
                <form onSubmit={addExpense} className="expense-form">
                    <div className="form-field">
                        <label htmlFor="expense-name">Name</label>
                        <input
                            id="expense-name"
                            type="text"
                            value={newExpense.name}
                            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                            placeholder="Expense name"
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="expense-amount">Amount</label>
                        <input
                            id="expense-amount"
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                            placeholder="Amount"
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="expense-category">Category</label>
                        <select
                            id="expense-category"
                            value={newExpense.category}
                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">
                        <FontAwesomeIcon icon={faPlus} /> Add
                    </button>
                </form>
            </div>

            <div className="finance-settings">
                <div className="threshold-settings">
                    <h3>Expense Thresholds</h3>
                    <div className="threshold-inputs">
                        <div className="threshold-input">
                            <label style={{ color: '#4CAF50' }}>Good (up to):</label>
                            <input
                                type="number"
                                value={thresholds.green}
                                onChange={(e) => updateThresholds('green', e.target.value)}
                                min="0"
                                max="100"
                            /> %
                        </div>
                        <div className="threshold-input">
                            <label style={{ color: '#FFA500' }}>Warning (up to):</label>
                            <input
                                type="number"
                                value={thresholds.orange}
                                onChange={(e) => updateThresholds('orange', e.target.value)}
                                min="0"
                                max="100"
                            /> %
                        </div>
                        <div className="threshold-input">
                            <label style={{ color: '#FF4444' }}>Critical (up to):</label>
                            <input
                                type="number"
                                value={thresholds.red}
                                onChange={(e) => updateThresholds('red', e.target.value)}
                                min="0"
                                max="100"
                            /> %
                        </div>
                    </div>
                </div>

                <div className="finance-summary">
                    <div className="total-expenses">
                        <h3>Total Expenses</h3>
                        <h2>${calculateTotal().toFixed(2)}</h2>
                        <div className="expense-percentage">
                            ({finance.income ? ((calculateTotal() / finance.income) * 100).toFixed(1) : 0}% of income)
                        </div>
                    </div>
                    <div className="current-balance">
                        <h3>Current Balance</h3>
                        <h2>${(finance.income - calculateTotal()).toFixed(2)}</h2>
                    </div>
                    <div className="status-indicator">
                        <h3>Status</h3>
                        <h2 style={{ color: calculateStatus().color }}>
                            {calculateStatus().status}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}
