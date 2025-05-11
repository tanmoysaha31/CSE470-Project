// server.js (add these lines to your existing server.js)
const expenseRoutes = require('./routes/api/expenses');
const incomeRoutes = require('./routes/api/incomes');

// Add routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);