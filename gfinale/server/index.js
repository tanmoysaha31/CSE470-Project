const express = require('express');
const cors = require('cors');
const {mongoose} = require('mongoose');
const dotenv = require('dotenv');
// Load environment variables from .env and .env.local
dotenv.config();
dotenv.config({ path: '.env.local' });
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

// Enable CORS with credentials
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173', // your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Log all request bodies for debugging
app.use((req, res, next) => {
    if (['POST', 'PUT'].includes(req.method)) {
        console.log('Request body:', req.body);
    }
    next();
});

// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/noteRoutes'));
app.use('/', require('./routes/aiRoutes'));
app.use('/', require('./routes/taskRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
});

const port = 8000;
app.listen(port, () => console.log("Server is running on port " + port));