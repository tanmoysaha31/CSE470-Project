// filepath: d:\Codes\Project\lifeAI\CSE470-Project\server\controllers\uploadController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

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

const deleteProfilePicture = async (req, res) => {
    try {
        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user with current profile picture
        const user = await User.findById(decoded.id);
        
        if (!user.profilePicture) {
            return res.status(400).json({ error: 'No profile picture to delete' });
        }
        
        // Delete the file from the server
        const filePath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Update user in database to remove profile picture
        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { profilePicture: null },
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
            message: 'Profile picture deleted successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture
            }
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Error deleting profile picture' });
    }
};

module.exports = { uploadProfilePicture, deleteProfilePicture };