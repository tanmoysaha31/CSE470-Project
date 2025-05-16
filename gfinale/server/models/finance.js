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
    budget: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                // Validation will happen at the controller level to compare with income
                return value >= 0;
            },
            message: 'Budget must be a positive number'
        }
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
    budget: {
        type: Number,
        default: 0
    },
    expenses: [expenseSchema]
}, { timestamps: true });

module.exports = mongoose.model('finance', financeSchema);