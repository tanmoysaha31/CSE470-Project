const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to require sign in
const requireSignIn = (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: 'Authentication required. Please login.' });
        }

        jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
            
            // Find user from decoded token
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Attach user to request object
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    requireSignIn
}; 