const express = require('express');
const cors = require('cors');
const {mongoose} = require('mongoose');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const app = express();
const authRoutes = require('./routes/authRoutes');
const financeRoutes = require('./routes/financeRoutes');


//db connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("DB not connected", err));


//middleware
app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({extended: false}))
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);


app.use('/',require('./routes/authRoutes'));


const port = 8000;
app.listen(port, () => console.log("Server is running on port " + port));