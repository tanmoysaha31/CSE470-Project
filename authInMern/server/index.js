require("dotenv").config();
const express = require("express");
const cors = require("cors")
const db = require("./db");         //Importing database connections
const authRoutes = require('./routes/authRoutes');   
const app = express();

//middleware
app.use(express.json());
app.use(cors());

//connect to database
db();

//Use authenticationroutes
app.use('/api/auth', authRoutes);   //Mount the auth Routes

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`)); 
