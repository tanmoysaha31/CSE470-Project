const mongoose = require('mongoose');

module.exports =  () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    
    //Connect to MongoDB using the connection string from .env file
    mongoose.connect(process.env.MONGODB_URI, connectionParams)
        .then(() => {
            console.log("Connected to MongoDB"); //success msg
        })
        .catch((error) => {
            console.error('Database connection error', error); //error msg
        });
};