const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require('../models/task');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

exports.generateResponse = async (req, res) => {
    try {
        const { prompt } = req.body;
        const { token } = req.cookies;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Get user ID from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Check if the prompt is task-related
        const isTaskQuery = prompt.toLowerCase().includes('task') || 
                          prompt.toLowerCase().includes('due') || 
                          prompt.toLowerCase().includes('schedule');

        let enhancedPrompt = prompt;

        if (isTaskQuery) {
            // Get user's tasks from MongoDB
            const now = new Date();
            const tasks = await Task.find({ userId });

            // Categorize tasks
            const dueTasks = tasks.filter(task => new Date(task.end) < now);
            const todayTasks = tasks.filter(task => {
                const taskDate = new Date(task.start);
                return taskDate.toDateString() === now.toDateString();
            });
            const futureTasks = tasks.filter(task => new Date(task.start) > now);

            // Create a task summary
            const taskSummary = `
Here are your tasks:

Due/Overdue Tasks (${dueTasks.length}):
${dueTasks.map(task => `- ${task.title} (Due: ${new Date(task.end).toLocaleDateString()})`).join('\n')}

Today's Tasks (${todayTasks.length}):
${todayTasks.map(task => `- ${task.title}`).join('\n')}

Future Tasks (${futureTasks.length}):
${futureTasks.map(task => `- ${task.title} (Scheduled: ${new Date(task.start).toLocaleDateString()})`).join('\n')}

Based on this information, `;

            enhancedPrompt = taskSummary + prompt;
        }

        // Initialize the model with the correct name
        const model = genAI.getGenerativeModel({ 
            model: "models/gemini-2.5-pro-exp-03-25"
        });
        
        if (!model) {
            throw new Error('Failed to initialize AI model');
        }

        // Generate content with task context
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
            throw new Error('Empty response from AI');
        }

        // Format the response to highlight key information
        const formattedText = isTaskQuery ? formatTaskResponse(text) : text;

        res.json({ message: formattedText });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate AI response',
            details: error.message
        });
    }
};

// Helper function to format task-related responses
const formatTaskResponse = (text) => {
    // Add markdown-style formatting
    const formatted = text
        .replace(/Due Tasks?:/g, '**Due Tasks:**')
        .replace(/Today's Tasks?:/g, "**Today's Tasks:**")
        .replace(/Future Tasks?:/g, '**Future Tasks:**')
        .replace(/Suggestions?:/g, '**Suggestions:**')
        .replace(/Priority:/g, '**Priority:**')
        .replace(/(\d+\.\s)/g, '\n$1') // Add newlines before numbered items
        .replace(/(\*\s)/g, '\n$1');    // Add newlines before bullet points

    return formatted;
};