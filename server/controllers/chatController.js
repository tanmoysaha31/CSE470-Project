const Chat = require('../models/chat');
const jwt = require('jsonwebtoken');

const createChat = async (req, res) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const chat = await Chat.create({
            title: req.body.title,
            messages: req.body.messages,
            userId: decoded.id
        });

        res.json(chat);
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(400).json({ error: error.message });
    }
};

const getChats = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const chats = await Chat.find({ userId: userId }).sort({ updatedAt: -1 });
        res.json(chats);
    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({ error: 'Error fetching chats' });
    }
};

const getChat = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const chat = await Chat.findOne({ 
            _id: req.params.id,
            userId: decoded.id  // Make sure this matches your schema
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Return formatted chat data
        res.json({
            _id: chat._id,
            title: chat.title,
            messages: chat.messages,
            userId: chat.userId
        });

    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ error: 'Error fetching chat' });
    }
};

const updateChat = async (req, res) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const chat = await Chat.findOneAndUpdate(
            { _id: req.params.id, userId: decoded.id },
            {
                title: req.body.title,
                messages: req.body.messages
            },
            { new: true }
        );
        
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        
        res.json(chat);
    } catch (error) {
        console.error('Update chat error:', error);
        res.status(400).json({ error: error.message });
    }
};

const deleteChat = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const chat = await Chat.findOneAndDelete({ 
            _id: req.params.id,
            userId: decoded.id 
        });

        if (!chat) return res.status(404).json({ error: 'Chat not found' });
        
        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({ error: 'Error deleting chat' });
    }
};

module.exports = {
    createChat,
    getChats,
    getChat,
    updateChat,
    deleteChat
};