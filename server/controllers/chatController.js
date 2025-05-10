const Chat = require('../models/chat');
const jwt = require('jsonwebtoken');

exports.createChat = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { messages } = req.body;

        if (!messages || !messages.length) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        // Create a meaningful title from the first user message
        const userMessage = messages.find(m => m.type === 'user');
        const title = (userMessage?.content || messages[0]?.content || 'New Chat')
            .slice(0, 30) + '...';

        const chat = await Chat.create({
            userId: decoded.id,
            title,
            messages,
            lastUpdated: new Date()
        });
        
        console.log('Chat created:', chat);
        res.json(chat);
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getChats = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const chats = await Chat.find({ userId: decoded.id })
            .sort({ lastUpdated: -1 });
        
        console.log(`Found ${chats.length} chats for user ${decoded.id}`);
        res.json(chats);
    } catch (error) {
        console.error('Get chats error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getChat = async (req, res) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const chat = await Chat.findOne({ 
            _id: req.params.id,
            userId: decoded.id 
        });
        
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        
        res.json(chat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateChat = async (req, res) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { messages } = req.body;
        const chat = await Chat.findOneAndUpdate(
            { 
                _id: req.params.id,
                userId: decoded.id 
            },
            { 
                $set: { 
                    messages,
                    lastUpdated: Date.now()
                }
            },
            { new: true }
        );
        
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        
        res.json(chat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteChat = async (req, res) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const chat = await Chat.findOneAndDelete({
            _id: req.params.id,
            userId: decoded.id
        });
        
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        
        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};