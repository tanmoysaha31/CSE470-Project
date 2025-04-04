require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { copyFileSync } = require("fs");

const mongoose = require('mongoose');
const bodyParser = require('body-parser'); //might require it. importing body parser
const authRoutes = require('./routes.authRoutes'); //authentication route import


//middleware
app.use(express.json());
app.use(cors());

app.use(bodyParser.json()); //parsing json req bodies

const port = process.env.PORT || 5000; // 5000 or 3000?

//Connecting to MongoDB. from environment vars //updated in db.js
mongoose.connect(process.env.MONGODB_URI, { //Update MONGODB_URI from .env file when ready
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connection successful to MONGODB"); //success msg
})
.catch(err => {
    console.error("MongoDB connection error:", err); //error msg
});

//Use auth routes
app.use('/api/auth', authRoutes);


app.listen(port, () => console.log(`Listening on port ${port}`)); 

