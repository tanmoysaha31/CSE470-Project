const express = require('express');
const cors = require('cors');
const {mongoose} = require('mongoose');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();


//db connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("DB not connected", err));


//middleware
app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({extended: false}))

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enable CORS
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173' // your frontend URL
}));

app.use('/',require('./routes/authRoutes'));


const port = 8000;
app.listen(port, () => console.log("Server is running on port " + port));