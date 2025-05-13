// filepath: d:\Codes\Project\lifeAI\CSE470-Project\server\controllers\uploadController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const imageUrl = `/uploads/${req.file.filename}`;
        
        // Update user in database with new profile picture
        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { profilePicture: imageUrl },
            { new: true }
        );

        // Create new token with updated user info
        const newToken = jwt.sign({
            id: updatedUser._id,
            email: updatedUser.email,
            name: updatedUser.name,
            profilePicture: updatedUser.profilePicture
        }, process.env.JWT_SECRET);

        // Set new token in cookie
        res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({
            message: 'Profile picture uploaded successfully',
            imageUrl: imageUrl,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
};

module.exports = { uploadProfilePicture };