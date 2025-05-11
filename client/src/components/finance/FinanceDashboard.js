// src/components/finance/FinanceDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from './Calendar';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';
import FinanceSummary from './FinanceSummary';
import { Container, Grid, Paper, Typography, Box, Tabs, Tab } from '@mui/material';

const FinanceDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchExpenses = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const res = await axios.get(`/api/expenses/monthly/${year}/${month}`);
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const fetchIncomes = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const res = await axios.get(`/api/incomes/monthly/${year}/${month}`);
      setIncomes(res.data);
    } catch (err) {
      console.error('Error fetching incomes:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const res = await axios.get(`/api/incomes/summary/${year}/${month}`);
      setSummary(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setLoading(false);
    }
  };

  const handleMonthChange = (date) => {
    setCurrentDate(date);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const addExpense = async (expenseData) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post('/api/expenses', expenseData, config);
      setExpenses([...expenses, res.data]);
      fetchSummary();
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const addIncome = async (incomeData) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post('/api/incomes', incomeData, config);
      setIncomes([...incomes, res.data]);
      fetchSummary();
    } catch (err) {
      console.error('Error adding income:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchIncomes();
    fetchSummary();
  }, [currentDate]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Finance Manager
      </Typography>
      
      <Grid container spacing={3}>
        {/* Calendar Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Calendar 
              currentDate={currentDate}
              onMonthChange={handleMonthChange}
              onDateSelect={handleDateSelect}
              expenses={expenses}
            />
          </Paper>
        </Grid>
        
        {/* Form Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="finance tabs">
                <Tab label="Expense" />
                <Tab label="Income" />
              </Tabs>
            </Box>
            
            {activeTab === 0 && (
              <ExpenseForm 
                selectedDate={selectedDate} 
                addExpense={addExpense} 
              />
            )}
            
            {activeTab === 1 && (
              <IncomeForm 
                selectedDate={selectedDate} 
                addIncome={addIncome} 
              />
            )}
          </Paper>
        </Grid>
        
        {/* Summary Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Summary
            </Typography>
            
            {loading ? (
              <Typography>Loading summary...</Typography>
            ) : (
              <FinanceSummary 
                summary={summary} 
                currentDate={currentDate} 
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FinanceDashboard;