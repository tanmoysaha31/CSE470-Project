const User = require("../models/User");   //directory is still left
const bcrypt = require("bcrypt");         //Import bcrypt for password hashing
const jwt = require("jsonwebtoken");

//login function
const login = async(req, res) => {
    const { username, password } = req.body;   //Destructure username and pass from req body

    try {
        //find user using username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json( {message: "User not found" } ); 
        }
        
        //comparing passwords with hash passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password"} );
        }

        //create and assign token
        const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, {expiredIn: "1h" });
        res.json({token});

        //If login successful send sucess message
        res.status(200).json({ message: "Login Successful" });
    } catch (error) {
        console.error("Error during login", error);
        res.status(500).json({ message: "Server Error"});
    }
};

//Signup function
const signup = async (req,res) => {
    const {username, password } =req.body; //destructure username and pass from request body

    try {
        //check if the user already exists
        const existingUser = await User.findOne({username});
        if ( existingUser) {
            return res.status(400).json({ message: "User already exists"});
        }    

        //hash password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        //Create new user instance
        const newUser = new User({ username, password: hashedPassword});
        await newUser.save();  

        //send success message
        res.status(201).json({ message: "User created successfully" });
    } catch(error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message:"Server error" });
    }
};

//Export login and signup function
module.exports = { login, signup };