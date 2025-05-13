const Finance = require('../models/finance');

// Add a new finance record
const addFinance = async (req, res) => {
  const { date, type, amount, description } = req.body;
  const userId = req.user.id; // From auth middleware

  try {
    const newFinance = new Finance({
      userId,
      date,
      type,
      amount,
      description,
    });
    await newFinance.save();
    res.status(201).json({ message: 'Finance record added', finance: newFinance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get finance records for a specific date
const getFinanceByDate = async (req, res) => {
  const { date } = req.query;
  const userId = req.user.id;

  try {
    const records = await Finance.find({
      userId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999),
      },
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get monthly summary
const getMonthlySummary = async (req, res) => {
  const { year, month } = req.query; // e.g., year=2025, month=5
  const userId = req.user.id;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const summary = await Finance.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const result = { income: 0, expense: 0 };
    summary.forEach((item) => {
      if (item._id === 'income') result.income = item.total;
      if (item._id === 'expense') result.expense = item.total;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { addFinance, getFinanceByDate, getMonthlySummary };