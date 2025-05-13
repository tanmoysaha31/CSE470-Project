const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        default: 'Other'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const financeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    income: {
        type: Number,
        default: 0
    },
    expenses: [expenseSchema]
}, { timestamps: true });

module.exports = mongoose.model('finance', financeSchema);