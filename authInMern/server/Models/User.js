const mongoose = require('mongoose');

//Defining user schema
const userSchema = new mongoose.Schema({
    username: {
        type : String,
        required : true,
        unique : true,
    },
    password: {
        type : String,
        required : true
    }
});

//Here's the user model
const User = mongoose.model('User', userSchema);


module.exports = User;

