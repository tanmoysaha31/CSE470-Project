const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require('../models/task');
const Finance = require('../models/Finance');
const Chat = require('../models/chat');
const Note = require('../models/note');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Store conversation history in memory (Note: For production, consider using Redis or similar)
const conversationHistory = new Map();

// Clear old conversations periodically to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [userId, data] of conversationHistory.entries()) {
        try {
            // Remove conversations older than 30 minutes
            if (!data || !data.lastUpdated || now - data.lastUpdated > 30 * 60 * 1000) {
                conversationHistory.delete(userId);
            }
            
            // Also check if history has valid format, if not remove it
            if (!data || !Array.isArray(data.history)) {
                console.log(`Removing invalid history format for user ${userId}`);
                conversationHistory.delete(userId);
            }
        } catch (error) {
            console.error(`Error cleaning up conversation for user ${userId}:`, error);
            // Delete entry if there's an error processing it
            conversationHistory.delete(userId);
        }
    }
}, 15 * 60 * 1000); // Check every 15 minutes

// New function to summarize notes
exports.summarizeNote = async (req, res) => {
    try {
        const { noteName, prompt } = req.body;
        const { token } = req.cookies;
        
        if (!noteName) {
            return res.status(400).json({ error: 'Note name is required' });
        }

        // Get user ID from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Find the note by title (using case-insensitive regex search)
        const note = await Note.findOne({ 
            userId,
            title: { $regex: new RegExp(noteName, 'i') }
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Initialize model with Gemini Pro model
        const model = genAI.getGenerativeModel({ 
            model: "models/gemini-1.5-flash-002"
        });
        
        if (!model) {
            throw new Error('Failed to initialize AI model');
        }

        // Create the prompt for summarization
        let summarizationPrompt = `Please summarize the following note titled "${note.title}":\n\n${note.content}`;
        
        // Add custom instructions if provided
        if (prompt) {
            summarizationPrompt += `\n\nAdditional instructions: ${prompt}`;
        }

        // Generate the summary
        const result = await model.generateContent(summarizationPrompt);
        const response = result.response;
        const summary = response.text();

        if (!summary) {
            throw new Error('Empty response from AI');
        }

        res.json({ 
            note: {
                title: note.title,
                id: note._id
            },
            summary 
        });
    } catch (error) {
        console.error('AI Summarization Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate note summary',
            details: error.message
        });
    }
};

exports.generateResponse = async (req, res) => {
    try {
        const { prompt, chatId } = req.body;
        const { token } = req.cookies;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Get user ID from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Initialize model with standard Gemini Pro model
        const model = genAI.getGenerativeModel({ 
            model: "models/gemini-1.5-flash-002"
        });
        
        if (!model) {
            throw new Error('Failed to initialize AI model');
        }

        // Get context data
        const contextData = await getContextData(userId);

        // Create a chat
        let chat;
        let history = [];

        // Load existing chat history if chatId is provided
        if (chatId) {
            // Try to get from memory cache first
            if (conversationHistory.has(userId)) {
                const cachedData = conversationHistory.get(userId);
                if (cachedData && Array.isArray(cachedData.history)) {
                    history = cachedData.history;
                } else {
                    // Reset history if invalid format
                    history = [];
                }
            } else {
                // If not in memory, try to reconstruct from database
                const existingChat = await Chat.findOne({ _id: chatId, userId });
                if (existingChat && existingChat.messages.length > 0) {
                    // Convert messages to the format Gemini expects
                    const reconstructedHistory = [];
                    for (let i = 0; i < existingChat.messages.length; i++) {
                        const msg = existingChat.messages[i];
                        if (msg.type === 'user') {
                            reconstructedHistory.push({
                                role: "user",
                                parts: [{ text: msg.content }]
                            });
                        } else if (msg.type === 'bot' && i > 0) {
                            reconstructedHistory.push({
                                role: "model",
                                parts: [{ text: msg.content }]
                            });
                        }
                    }
                    history = reconstructedHistory;
                }
            }

            // Add system context if this is the first message in a reconstructed chat
            if (!Array.isArray(history) || history.length < 2) {
                // Create a fresh history array when invalid
                history = [];
                
                const initialContext = `You are an intelligent personal assistant in the LifeSync app. You can help with tasks, finance, notes, and general questions.
Today is ${new Date().toLocaleDateString()}.
${contextData.taskContext}
${contextData.financeContext}
${contextData.notesContext}

Always be helpful, concise, and friendly in your responses. If you reference data from the user's tasks, finances, or notes, make it clear where that information comes from.`;

                // Add system message at the beginning of history
                history.unshift({
                    role: "user",
                    parts: [{ text: "System: " + initialContext }]
                }, {
                    role: "model",
                    parts: [{ text: "I understand. I'll help you manage your tasks, finances, notes, and answer other questions. What can I assist you with today?" }]
                });
            }
            
            try {
                chat = await model.startChat({ history });
            } catch (error) {
                console.error('Error starting chat with history:', error);
                // Fallback to starting a fresh chat
                history = [
                    { role: "user", parts: [{ text: "System: Hello" }] },
                    { role: "model", parts: [{ text: "Hello! How can I assist you today?" }] }
                ];
                chat = await model.startChat({ history });
            }
        } else {
            // New chat with initial context
            const initialContext = `You are an intelligent personal assistant in the LifeSync app. You can help with tasks, finance, notes, and general questions.
Today is ${new Date().toLocaleDateString()}.
${contextData.taskContext}
${contextData.financeContext}
${contextData.notesContext}

Always be helpful, concise, and friendly in your responses. If you reference data from the user's tasks, finances, or notes, make it clear where that information comes from.`;

            try {
                const initialHistory = [
                    { role: "user", parts: [{ text: "System: " + initialContext }] },
                    { role: "model", parts: [{ text: "I understand. I'll help you manage your tasks, finances, notes, and answer other questions. What can I assist you with today?" }] }
                ];
                
                chat = await model.startChat({
                    history: initialHistory
                });
                
                // Get initial history
                history = initialHistory;
            } catch (error) {
                console.error('Error starting new chat:', error);
                // Use a simple fallback
                const fallbackHistory = [
                    { role: "user", parts: [{ text: "Hi" }] },
                    { role: "model", parts: [{ text: "Hello! I'm your LifeSync assistant. How can I help you today?" }] }
                ];
                
                chat = await model.startChat({
                    history: fallbackHistory
                });
                
                history = fallbackHistory;
            }
        }

        try {
            // Send the user's message
            const result = await chat.sendMessage(prompt);
            const response = result.response;
            const text = response.text();

            if (!text) {
                throw new Error('Empty response from AI');
            }

            // Update conversation history in memory
            try {
                history = chat.getHistory();
                // Verify that history is an array before storing
                if (Array.isArray(history)) {
                    conversationHistory.set(userId, {
                        history,
                        lastUpdated: Date.now()
                    });
                } else {
                    console.error('Invalid history format returned from chat.getHistory()');
                    // Store a basic history structure to avoid future errors
                    conversationHistory.set(userId, {
                        history: [
                            { role: "user", parts: [{ text: prompt }] },
                            { role: "model", parts: [{ text }] }
                        ],
                        lastUpdated: Date.now()
                    });
                }
            } catch (error) {
                console.error('Error saving chat history:', error);
            }

            res.json({ message: text });
        } catch (error) {
            // Handle rate limit errors specifically
            if (error.message && error.message.includes('429') && error.message.includes('quota')) {
                return res.status(429).json({ 
                    error: 'API rate limit exceeded',
                    details: 'The Gemini API quota has been exceeded. Please try again later or upgrade your API plan.',
                    message: 'Our AI service is currently experiencing high demand. Please try again in a few minutes.'
                });
            }
            
            // Handle other errors
            throw error;
        }
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate AI response',
            details: error.message
        });
    }
};

// Get context data from tasks, finance, and notes
async function getContextData(userId) {
    try {
        // Get task data
        const now = new Date();
        const tasks = await Task.find({ userId });

        // Categorize tasks
        const dueTasks = tasks.filter(task => new Date(task.end) < now);
        const todayTasks = tasks.filter(task => {
            const taskDate = new Date(task.start);
            return taskDate.toDateString() === now.toDateString();
        });
        const futureTasks = tasks.filter(task => new Date(task.start) > now);

        // Create task context
        let taskContext = '';
        if (tasks.length > 0) {
            taskContext = `
Here are your tasks:

Due/Overdue Tasks (${dueTasks.length}):
${dueTasks.map(task => `- ${task.title} (Due: ${new Date(task.end).toLocaleDateString()})`).join('\n')}

Today's Tasks (${todayTasks.length}):
${todayTasks.map(task => `- ${task.title}`).join('\n')}

Future Tasks (${futureTasks.length}):
${futureTasks.map(task => `- ${task.title} (Scheduled: ${new Date(task.start).toLocaleDateString()})`).join('\n')}
`;
        }

        // Get finance data
        const finance = await Finance.findOne({ userId });
        
        // Create finance context
        let financeContext = '';
        if (finance) {
            // Calculate total expenses
            const totalExpenses = finance.expenses.reduce((total, expense) => total + expense.amount, 0);
            
            // Group expenses by category
            const expensesByCategory = {};
            finance.expenses.forEach(expense => {
                const category = expense.category || 'Other';
                if (!expensesByCategory[category]) {
                    expensesByCategory[category] = 0;
                }
                expensesByCategory[category] += expense.amount;
            });

            // Format finance information
            financeContext = `
Here's your financial information:

Monthly Income: $${finance.income.toFixed(2)}
Total Expenses: $${totalExpenses.toFixed(2)}
Current Balance: $${(finance.income - totalExpenses).toFixed(2)}
Budget Status: ${totalExpenses > finance.income ? 'Exceeded' : (totalExpenses/finance.income > 0.9 ? 'Critical' : (totalExpenses/finance.income > 0.7 ? 'Warning' : 'Good'))}

Expenses by Category:
${Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)} (${finance.income > 0 ? ((amount/finance.income)*100).toFixed(1) : 0}% of income)`)
    .join('\n')}
`;
        }

        // Get notes data - enhanced with more details
        const notes = await Note.find({ userId }).sort({ updatedAt: -1 }).limit(10);
        let notesContext = '';
        
        if (notes && notes.length > 0) {
            notesContext = `
Your notes (${notes.length} most recent):
${notes.map((note, index) => {
    // Format updated date
    const updatedDate = new Date(note.updatedAt).toLocaleDateString();
    
    // Get a preview of content (up to 150 chars)
    const contentPreview = note.content.substring(0, 150).replace(/\n/g, ' ');
    const hasMoreContent = note.content.length > 150;
    
    return `- "${note.title}" (Updated: ${updatedDate}): ${contentPreview}${hasMoreContent ? '...' : ''}`;
}).join('\n')}

When asked to summarize a specific note, I'll access its full content and provide a summary.
`;
        }

        return {
            taskContext: taskContext || "No tasks found.",
            financeContext: financeContext || "No financial data found.",
            notesContext: notesContext || "No notes found."
        };
    } catch (error) {
        console.error('Error getting context data:', error);
        return {
            taskContext: "Error retrieving task data.",
            financeContext: "Error retrieving financial data.",
            notesContext: "Error retrieving notes data."
        };
    }
}