import React, { useState, useEffect, useContext } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { UserContext } from '../context/userContext';
import '../App.css'; // For styling

const Finance = () => {
  const { user } = useContext(UserContext); // Assuming user context provides user info
  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    amount: '',
    description: '',
  });

  // Fetch records for the selected date
  const fetchRecords = async (selectedDate) => {
    try {
      const response = await axios.get('http://localhost:5000/api/finance/date', {
        params: { date: selectedDate },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  // Fetch monthly summary
  const fetchSummary = async () => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    try {
      const response = await axios.get('http://localhost:5000/api/finance/summary', {
        params: { year, month },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/finance/add', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchRecords(date); // Refresh records after adding
      setFormData({ ...formData, amount: '', description: '' }); // Reset form
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  // Update records when date changes
  useEffect(() => {
    if (user) fetchRecords(date);
  }, [date, user]);

  return (
    <div className="finance-page">
      <h1>Finance Tracker</h1>

      {/* Form to add income/expense */}
      <form onSubmit={handleSubmit} className="finance-form">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
        <select name="type" value={formData.type} onChange={handleInputChange}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Add Record</button>
      </form>

      {/* Calendar */}
      <div className="calendar-container">
        <Calendar onChange={setDate} value={date} />
      </div>

      {/* Display records for the selected date */}
      <div className="records">
        <h2>Records for {date.toDateString()}</h2>
        {records.length > 0 ? (
          <ul>
            {records.map((record) => (
              <li key={record._id}>
                {record.type.toUpperCase()}: ${record.amount} - {record.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No records for this date.</p>
        )}
      </div>

      {/* Monthly Summary */}
      <button onClick={fetchSummary}>Show Monthly Summary</button>
      {summary && (
        <div className="summary">
          <h2>Summary for {date.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <p>Total Income: ${summary.income}</p>
          <p>Total Expense: ${summary.expense}</p>
          <p>Net Balance: ${(summary.income - summary.expense).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default Finance;