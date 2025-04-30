const Task = require('../models/task');
const jwt = require('jsonwebtoken');

exports.createTask = async (req, res) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const task = await Task.create({
            userId: decoded.id,
            ...req.body
        });

        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getTasks = async(req, res) => {
    try {
        const{ token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tasks = await Task.find({ userId: decoded.id });
        res.json(tasks);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateTask = async (req,res) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify (token,process.env.JWT_SECRET);
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: decoded.id },req.body, 
            { new: true }
        );

        if (!task) return res.status(400).json({ error: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTask = async(req,res) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: decoded.id
        });

        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted successfully'});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};