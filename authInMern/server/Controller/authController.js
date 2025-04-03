const User = require("../models/User");   //directory is still left
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Controll login
const login = async(req, res) => {
    const { username, password } = req.body;

    try {
        //find user using username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json( {message: "User not Valid" } ); 
        }
        
        //comparing passwords using hash passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password not Valid"} );
        }

        //create and assign token
        const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, {expiredIn: "1h" });
        res.json({token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error"});
    }
};

module.exports = { login };