import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faDownload, faExclamationTriangle, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../assets/styles/finance.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
    LabelList,
    ComposedChart,
    Line
} from 'recharts';

export default function Finance() {
    const [finance, setFinance] = useState({ income: 0, budget: 0, expenses: [] });
    const [newExpense, setNewExpense] = useState({ name: '', amount: '', budget: '', category: 'Other' });
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState({ name: '', amount: '', budget: '', category: 'Other' });
    const [thresholds, setThresholds] = useState({
        green: 50,
        orange: 70,
        red: 90
    });
    const [budgetSummary, setBudgetSummary] = useState(null);
    const [loadingBudget, setLoadingBudget] = useState(false);
    const [showBudgetWarning, setShowBudgetWarning] = useState(false);
    const [remainingBudget, setRemainingBudget] = useState(0);
    const financeSummaryRef = useRef(null);
    
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
    
    // Add useEffect to fetch budget summary
    useEffect(() => {
        fetchBudgetSummary();
    }, [finance]);

    // Calculate remaining budget when finance or expenses change
    useEffect(() => {
        calculateRemainingBudget();
        validateBudget();
    }, [finance]);

    const calculateRemainingBudget = () => {
        const totalBudgeted = finance.expenses.reduce((total, expense) => 
            total + (parseFloat(expense.budget) || 0), 0);
        
        setRemainingBudget(finance.budget - totalBudgeted);
    };

    const validateBudget = () => {
        // Show warning if budget exceeds income
        setShowBudgetWarning(finance.budget > finance.income);
    };

    const fetchFinanceData = async () => {
        try {
            const { data } = await axios.get('/finance', { withCredentials: true });
            // Ensure budget is set, default to income if not set
            if (data.budget === undefined) {
                data.budget = data.income || 0;
            }
            setFinance(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch finance data');
            setLoading(false);
        }
    };
    
    // New function to fetch budget summary
    const fetchBudgetSummary = async () => {
        try {
            if (!finance || !finance.expenses || finance.expenses.length === 0) {
                setBudgetSummary(null);
                return;
            }
            
            setLoadingBudget(true);
            const { data } = await axios.get('/finance/budget', { withCredentials: true });
            setBudgetSummary(data);
        } catch (error) {
            console.error('Failed to fetch budget summary:', error);
            toast.error('Failed to load budget data');
        } finally {
            setLoadingBudget(false);
        }
    };

    const updateIncome = async (e) => {
        try {
            const { data } = await axios.put('/finance/income', {
                income: finance.income
            }, { withCredentials: true });
            setFinance({...data, budget: data.budget || data.income});
            toast.success('Income updated');
            validateBudget();
        } catch (error) {
            toast.error('Failed to update income');
        }
    };

    const updateBudget = async () => {
        try {
            if (isNaN(finance.budget) || finance.budget < 0) {
                toast.error('Please enter a valid budget');
                return;
            }
            
            const { data } = await axios.put('/finance/budget', {
                budget: finance.budget
            }, { withCredentials: true });
            setFinance(data);
            toast.success('Budget updated');
            validateBudget();
        } catch (error) {
            toast.error('Failed to update budget');
        }
    };

    const addExpense = async (e) => {
        e.preventDefault();
        try {
            // Validate input
            if (!newExpense.name.trim()) {
                toast.error('Name is required');
                return;
            }

            const amount = parseFloat(newExpense.amount);
            if (isNaN(amount) || amount <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }
            
            const budget = parseFloat(newExpense.budget);
            if (isNaN(budget) || budget <= 0) {
                toast.error('Please enter a valid budget');
                return;
            }
            
            // Check if total budgeted amount will exceed total budget
            const currentBudgeted = finance.expenses.reduce((total, expense) => 
                total + (parseFloat(expense.budget) || 0), 0);
                
            if ((currentBudgeted + budget) > finance.budget) {
                toast.error('Total budgeted amount cannot exceed your total budget');
                return;
            }

            const { data } = await axios.post('/finance/expense', {
                name: newExpense.name,
                amount: amount,
                budget: budget,
                category: newExpense.category
            }, {
                withCredentials: true
            });
            setFinance(data);
            setNewExpense({ name: '', amount: '', budget: '', category: 'Other' });
            toast.success('Expense added');
        } catch (error) {
            console.error('Add expense error:', error);
            const errorMessage = error.response?.data?.details || 'Failed to add expense';
            toast.error(errorMessage);
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
            
            const budget = parseFloat(editValue.budget);
            if (isNaN(budget) || budget <= 0) {
                toast.error('Please enter a valid budget');
                return;
            }
            
            // Get the current expense to calculate difference in budget
            const currentExpense = finance.expenses.find(e => e._id === expenseId);
            const currentBudgeted = finance.expenses.reduce((total, expense) => 
                total + (parseFloat(expense.budget) || 0), 0);
            
            // Subtract the current expense's budget from the total to check if new budget fits
            const otherExpensesBudget = currentBudgeted - (currentExpense?.budget || 0);
            
            if ((otherExpensesBudget + budget) > finance.budget) {
                toast.error('Total budgeted amount cannot exceed your total budget');
                return;
            }

            const { data } = await axios.put(`/finance/expense/${expenseId}`, {
                name: editValue.name.trim(),
                amount: amount,
                budget: budget,
                category: editValue.category
            }, {
                withCredentials: true
            });

            if (data) {
                setFinance(data);
                setEditingId(null);
                setEditValue({ name: '', amount: '', budget: '', category: 'Other' });
                toast.success('Expense updated successfully');
            }
        } catch (error) {
            console.error('Update error details:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.details || 'Failed to update expense';
            toast.error(errorMessage);
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
            budget: expense.budget || 0,
            category: expense.category || 'Other'
        });
    };

    const calculateTotal = () => {
        return finance.expenses.reduce((total, expense) => total + expense.amount, 0);
    };
    
    const calculateTotalBudget = () => {
        return finance.expenses.reduce((total, expense) => total + (expense.budget || 0), 0);
    };

    const calculateStatus = () => {
        if (!finance.budget) return { status: 'neutral', color: 'var(--text-primary)' };
        
        const expensePercentage = (calculateTotal() / finance.budget) * 100;
        
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
        const budgetTotals = {};
        
        categories.forEach(category => {
            categoryTotals[category] = 0;
            budgetTotals[category] = 0;
        });
        
        finance.expenses.forEach(expense => {
            const category = expense.category || 'Other';
            categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
            budgetTotals[category] = (budgetTotals[category] || 0) + (expense.budget || 0);
        });
        
        return categories.map(category => ({
            name: category,
            amount: categoryTotals[category],
            budget: budgetTotals[category],
            percentage: finance.budget > 0 
                ? ((categoryTotals[category] / finance.budget) * 100).toFixed(1) 
                : 0,
            budgetPercentage: finance.budget > 0 
                ? ((budgetTotals[category] / finance.budget) * 100).toFixed(1)
                : 0
        }));
    };
    
    const getPieChartData = () => {
        return getCategoryData().filter(item => item.amount > 0);
    };
    
    const getBarChartData = () => {
        return getCategoryData();
    };
    
    const getBudgetProgressData = () => {
        const categoryData = getCategoryData();
        
        // Calculate the percentage of budget for each category
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
    
    // New function to get data for budget vs. actual spending comparison
    const getBudgetComparisonData = () => {
        if (!finance || !finance.expenses || finance.expenses.length === 0) {
            return [];
        }
        
        const data = [];
        const categoryTotals = {};
        const budgetTotals = {};
        
        // Sum up the expenses and budgets by category
        finance.expenses.forEach(expense => {
            const category = expense.category || 'Other';
            
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
                budgetTotals[category] = 0;
            }
            
            categoryTotals[category] += expense.amount || 0;
            budgetTotals[category] += expense.budget || 0;
        });
        
        // Add each category to the data array
        Object.keys(categoryTotals).forEach(category => {
            const spent = categoryTotals[category];
            const budget = budgetTotals[category];
            
            // Calculate percentages
            const budgetPercentage = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
            
            data.push({
                name: category,
                spent: spent,
                budget: budget,
                remaining: Math.max(0, budget - spent),
                percentage: budget > 0 ? Math.round((spent / budget) * 100) : 0
            });
        });
        
        // Sort by budget amount (descending)
        return data.sort((a, b) => b.budget - a.budget);
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

    // Generate and download PDF for finance summary
    const downloadFinanceSummary = async () => {
        try {
            if (!financeSummaryRef.current) {
                toast.error('Unable to generate summary');
                return;
            }
            
            toast.loading('Generating PDF...');
            
            const canvas = await html2canvas(financeSummaryRef.current, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            // Add title
            pdf.setFontSize(20);
            pdf.text('Finance Summary', 105, 15, { align: 'center' });
            
            // Add date
            pdf.setFontSize(12);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });
            
            // Add image of the summary
            pdf.addImage(imgData, 'PNG', 0, 30, imgWidth, imgHeight);
            
            // Download PDF
            pdf.save(`Finance_Summary_${new Date().toLocaleDateString()}.pdf`);
            
            toast.dismiss();
            toast.success('PDF downloaded successfully');
        } catch (error) {
            toast.dismiss();
            console.error('Failed to generate PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    // Generate detailed finance report as PDF
    const generateFinanceReport = async () => {
        try {
            toast.loading('Generating report...');
            
            // Create PDF document
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = 20;
            
            // Add title
            pdf.setFontSize(24);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Financial Report', 105, yPosition, { align: 'center' });
            yPosition += 15;
            
            // Add date
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, yPosition, { align: 'center' });
            yPosition += 20;
            
            // Add section divider
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
            
            // Add income and budget overview section
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Income & Budget Overview', margin, yPosition);
            yPosition += 10;
            
            // Overview data
            pdf.setFontSize(12);
            pdf.setTextColor(60, 60, 60);
            pdf.text(`Monthly Income: $${finance.income.toFixed(2)}`, margin, yPosition);
            yPosition += 8;
            pdf.text(`Monthly Budget: $${finance.budget.toFixed(2)}`, margin, yPosition);
            yPosition += 8;
            pdf.text(`Total Expenses: $${calculateTotal().toFixed(2)}`, margin, yPosition);
            yPosition += 8;
            pdf.text(`Remaining Balance: $${(finance.income - calculateTotal()).toFixed(2)}`, margin, yPosition);
            yPosition += 8;
            
            // Budget allocation
            const totalBudgeted = calculateTotalBudget();
            pdf.text(`Total Budget Allocated: $${totalBudgeted.toFixed(2)} (${finance.budget > 0 ? ((totalBudgeted / finance.budget) * 100).toFixed(1) : 0}%)`, margin, yPosition);
            yPosition += 8;
            pdf.text(`Budget Remaining: $${(finance.budget - totalBudgeted).toFixed(2)}`, margin, yPosition);
            yPosition += 20;
            
            // Add section divider
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
            
            // Expense breakdown by category
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Expense Breakdown by Category', margin, yPosition);
            yPosition += 15;
            
            // Category data
            const categoryData = getCategoryData();
            
            // Table header
            pdf.setFillColor(240, 240, 240);
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(margin, yPosition - 8, contentWidth, 10, 'F');
            
            pdf.setFontSize(11);
            pdf.setTextColor(40, 40, 40);
            pdf.text('Category', margin + 5, yPosition);
            pdf.text('Budget', margin + 65, yPosition);
            pdf.text('Actual', margin + 105, yPosition);
            pdf.text('% Used', margin + 145, yPosition);
            yPosition += 10;
            
            // Draw categories
            categoryData.forEach((category, index) => {
                if (yPosition > 270) {
                    // Add new page if we're near the bottom
                    pdf.addPage();
                    yPosition = 20;
                }
                
                if (index % 2 === 0) {
                    pdf.setFillColor(248, 248, 248);
                    pdf.rect(margin, yPosition - 8, contentWidth, 10, 'F');
                }
                
                pdf.setTextColor(60, 60, 60);
                pdf.text(category.name, margin + 5, yPosition);
                pdf.text(`$${category.budget.toFixed(2)}`, margin + 65, yPosition);
                pdf.text(`$${category.amount.toFixed(2)}`, margin + 105, yPosition);
                
                // Color-code percentage based on usage
                const percentUsed = category.budget > 0 ? (category.amount / category.budget) * 100 : 0;
                if (percentUsed > 100) {
                    pdf.setTextColor(192, 57, 43); // Red for over budget
                } else if (percentUsed > 80) {
                    pdf.setTextColor(211, 84, 0); // Orange for close to budget
                } else {
                    pdf.setTextColor(39, 174, 96); // Green for under budget
                }
                
                pdf.text(`${percentUsed.toFixed(1)}%`, margin + 145, yPosition);
                pdf.setTextColor(60, 60, 60);
                
                yPosition += 10;
            });
            
            yPosition += 10;
            
            // Add section divider
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;
            
            // Expense Details Section
            if (yPosition > 240) {
                // Add new page if we're near the bottom
                pdf.addPage();
                yPosition = 20;
            }
            
            pdf.setFontSize(16);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Expense Details', margin, yPosition);
            yPosition += 15;
            
            // Table header for expenses
            pdf.setFillColor(240, 240, 240);
            pdf.rect(margin, yPosition - 8, contentWidth, 10, 'F');
            
            pdf.setFontSize(11);
            pdf.setTextColor(40, 40, 40);
            pdf.text('Name', margin + 5, yPosition);
            pdf.text('Category', margin + 70, yPosition);
            pdf.text('Amount', margin + 120, yPosition);
            pdf.text('Budget', margin + 155, yPosition);
            yPosition += 10;
            
            // List all expenses
            finance.expenses.forEach((expense, index) => {
                if (yPosition > 270) {
                    // Add new page if we're near the bottom
                    pdf.addPage();
                    yPosition = 20;
                }
                
                if (index % 2 === 0) {
                    pdf.setFillColor(248, 248, 248);
                    pdf.rect(margin, yPosition - 8, contentWidth, 10, 'F');
                }
                
                // Truncate long expense names
                const expenseName = expense.name.length > 20 ? expense.name.substring(0, 18) + '...' : expense.name;
                
                pdf.setTextColor(60, 60, 60);
                pdf.text(expenseName, margin + 5, yPosition);
                pdf.text(expense.category || 'Other', margin + 70, yPosition);
                pdf.text(`$${expense.amount.toFixed(2)}`, margin + 120, yPosition);
                pdf.text(`$${expense.budget.toFixed(2)}`, margin + 155, yPosition);
                
                yPosition += 10;
            });
            
            // Add footer with app name
            const pageCount = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(150, 150, 150);
                pdf.text('LifeSync Finance Report', pageWidth - margin, 287);
                pdf.text(`Page ${i} of ${pageCount}`, margin, 287);
            }
            
            // Download PDF
            pdf.save(`Finance_Report_${new Date().toLocaleDateString()}.pdf`);
            
            toast.dismiss();
            toast.success('Financial report generated successfully');
        } catch (error) {
            toast.dismiss();
            console.error('Failed to generate financial report:', error);
            toast.error('Failed to generate report');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="finance-container">
            <div className="finance-sidebar">
                <div className="threshold-settings">
                    <h3>Expense Thresholds</h3>
                    <div className="threshold-inputs">
                        <div className="threshold-input">
                            <label style={{ color: '#4CAF50' }}>Good:</label>
                            <input
                                type="number"
                                value={thresholds.green}
                                onChange={(e) => updateThresholds('green', e.target.value)}
                                min="0"
                                max="100"
                            />
                            <span>%</span>
                        </div>
                        <div className="threshold-input">
                            <label style={{ color: '#FFA500' }}>Warning:</label>
                            <input
                                type="number"
                                value={thresholds.orange}
                                onChange={(e) => updateThresholds('orange', e.target.value)}
                                min="0"
                                max="100"
                            />
                            <span>%</span>
                        </div>
                        <div className="threshold-input">
                            <label style={{ color: '#FF4444' }}>Critical:</label>
                            <input
                                type="number"
                                value={thresholds.red}
                                onChange={(e) => updateThresholds('red', e.target.value)}
                                min="0"
                                max="100"
                            />
                            <span>%</span>
                        </div>
                    </div>
                </div>

                <div className="finance-summary" ref={financeSummaryRef}>
                    <div className="monthly-income">
                        <h3>Monthly Income</h3>
                        <h2>${finance.income.toFixed(2)}</h2>
                        <input
                            type="number"
                            value={finance.income}
                            onChange={(e) => setFinance({ ...finance, income: Number(e.target.value) })}
                            placeholder="Income"
                        />
                        <button onClick={updateIncome}>Update</button>
                    </div>
                    
                    <div className="monthly-budget">
                        <h3>Monthly Budget</h3>
                        <h2>${finance.budget.toFixed(2)}</h2>
                        <input
                            type="number"
                            value={finance.budget}
                            onChange={(e) => setFinance({ ...finance, budget: Number(e.target.value) })}
                            placeholder="Budget"
                        />
                        <button onClick={updateBudget}>Update</button>
                        {showBudgetWarning && (
                            <div className="budget-warning">
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <span>Budget exceeds income!</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="budget-allocation">
                        <h3>Budget Allocation</h3>
                        <div className="budget-meter">
                            <div className="budget-progress" style={{ 
                                width: `${finance.budget > 0 ? Math.min(100, (calculateTotalBudget() / finance.budget) * 100) : 0}%`,
                                backgroundColor: remainingBudget >= 0 ? '#4CAF50' : '#FF4444'
                            }}></div>
                        </div>
                        <div className="budget-stats">
                            <div className="budget-stat">
                                <span>Allocated:</span>
                                <span>${calculateTotalBudget().toFixed(2)}</span>
                            </div>
                            <div className="budget-stat">
                                <span>Remaining:</span>
                                <span style={{ color: remainingBudget >= 0 ? '#4CAF50' : '#FF4444' }}>
                                    ${Math.abs(remainingBudget).toFixed(2)}
                                    {remainingBudget < 0 && ' (Over)'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="total-expenses">
                        <h3>Total Expenses</h3>
                        <h2>${calculateTotal().toFixed(2)}</h2>
                        <div className="expense-percentage">
                            ({finance.budget > 0 ? ((calculateTotal() / finance.budget) * 100).toFixed(1) : 0}% of budget)
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
                    
                    <div className="finance-actions">
                        <button 
                            className="generate-report-btn"
                            onClick={generateFinanceReport}
                        >
                            <FontAwesomeIcon icon={faFileAlt} /> Generate Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="finance-main">
                <div className="finance-charts">
                    <div className="chart-container">
                        <h3>Budget vs. Actual Spending</h3>
                        {getBudgetComparisonData().length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart
                                    layout="vertical"
                                    data={getBudgetComparisonData()}
                                    margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip 
                                        formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'spent' ? 'Actual Spending' : 'Budget']}
                                        labelFormatter={(label) => `Category: ${label}`}
                                    />
                                    <Legend />
                                    <Bar 
                                        dataKey="budget" 
                                        name="Budget" 
                                        fill="#FF8C00" 
                                        barSize={20}
                                    />
                                    <Bar 
                                        dataKey="spent" 
                                        name="Actual Spending" 
                                        fill="#1E90FF" 
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data-message">No budget data to display</div>
                        )}
                    </div>
                    
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
                                    fill="#008000"
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
                                    label={({ name, amount }) => `${name}: $${amount.toFixed(2)}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="amount"
                                >
                                    {getPieChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                <Legend 
                                    formatter={(value, entry, index) => value} 
                                    payload={
                                        getPieChartData().map((item, index) => ({
                                            value: item.name,
                                            type: 'square',
                                            color: COLORS[index % COLORS.length],
                                        }))
                                    }
                                />
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
                                <Bar dataKey="amount" fill="#8884d8" name=" ">
                                    {getBarChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="expenses-section">
                    <h3>Expense List</h3>
                    <div className="expenses-list">
                        {finance.expenses.length === 0 ? (
                            <div className="no-expenses-message">No expenses added yet</div>
                        ) : (
                            finance.expenses.map((expense) => (
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
                                                <label htmlFor="edit-budget">Budget</label>
                                                <input
                                                    id="edit-budget"
                                                    type="number"
                                                    value={editValue.budget}
                                                    onChange={(e) => setEditValue({ 
                                                        ...editValue, 
                                                        budget: e.target.value ? parseFloat(e.target.value) : ''
                                                    })}
                                                    placeholder="Budget"
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
                                                        setEditValue({ name: '', amount: '', budget: '', category: 'Other' });
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
                                                {expense.budget ? <span className="budget-hint"> / ${expense.budget.toFixed(2)}</span> : ''}
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
                            ))
                        )}
                    </div>
                    
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
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                placeholder="Amount"
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="expense-budget">Budget</label>
                            <input
                                id="expense-budget"
                                type="number"
                                value={newExpense.budget}
                                onChange={(e) => setNewExpense({ ...newExpense, budget: e.target.value })}
                                placeholder="Budget"
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
            </div>
        </div>
    );
}
