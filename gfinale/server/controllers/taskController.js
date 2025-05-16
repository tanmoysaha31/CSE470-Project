const Task = require('../models/task');

// Create a new task
const createTask = async (req, res) => {
    try {
        const { title, type, start, end, description, allDay, completed } = req.body;
        
        // Create new task with current user ID
        const task = new Task({
            userId: req.user._id,
            title,
            type,
            start,
            end,
            description,
            allDay,
            completed
        });
        
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

// Get all tasks for a user
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user._id });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// Update a task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, start, end, description, allDay, completed } = req.body;
        
        // Find task and verify ownership
        const task = await Task.findById(id);
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Ensure user owns this task
        if (task.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this task' });
        }
        
        // Update task fields
        task.title = title;
        task.type = type;
        task.start = start;
        task.end = end;
        task.description = description;
        task.allDay = allDay;
        task.completed = completed;
        
        await task.save();
        res.status(200).json(task);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find task and verify ownership
        const task = await Task.findById(id);
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Ensure user owns this task
        if (task.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this task' });
        }
        
        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};
