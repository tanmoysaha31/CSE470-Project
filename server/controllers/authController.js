const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('test is working')
}



// Register user
const registerUser = async (req, res) => {
    try {
        const {firstname, lastname,  email, password} = req.body;
        if (!firstname || !lastname) {
            return res.json({ error: 'Please fill name' });
        }
        if (!password || password.length < 6) {
            return res.json({error: 'Password is required and must be 6 characters long'})
        }
        const exist = await User.findOne({email})
        if (exist) {
            return res.json({error: 'User already exists'})
        }
        const hashedPassword = await hashPassword(password) 
        const user = await User.create({
            name: firstname + ' ' + lastname,
            email,
            password : hashedPassword, 
        })
        return res.json({message: 'User registered successfully', user})
    }catch (error) {
        console.log(error)
    }
};


//login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ error: 'User not found' });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.json({ error: 'Invalid password' });
        }
        // Passwords match, so sign the JWT and return the response immediately
        return jwt.sign(
            { email: user.email, id: user._id, name: user.name },
            process.env.JWT_SECRET,
            {},
            (err, token) => {
                if (err) throw err;
                console.log("Generated JWT:", token);
                return res
                    .cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                    })
                    .json(user);
            }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

//get user profile
const getProfile = (req, res) => {
    const {token} = req.cookies 
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if (err) throw err;
            res.json(user)
        })
    } else {
        res.json(null)
    }
}

const updateProfile = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name, email, password } = req.body;
        
        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (password) {
            const hashedPassword = await hashPassword(password);
            updateFields.password = hashedPassword;
        }

        const user = await User.findByIdAndUpdate(
            decoded.id,
            updateFields,
            { new: true }
        );

        // Generate new token with updated info
        const newToken = jwt.sign(
            { email: user.email, id: user._id, name: user.name },
            process.env.JWT_SECRET
        );

        // Set the new token in cookie
        res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error updating profile' });
    }
};


module.exports = { 
    test, 
    registerUser, 
    loginUser, 
    getProfile,
    updateProfile 
}