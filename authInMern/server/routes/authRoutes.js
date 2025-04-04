const express = require('express');
const { login, signup } = require('../controllers/authController'); //Importing authController

const router = express.Router();

//Signup route

router.post('/signup', signup); //handling POST request to /api/auth/signup

//Login route

router.post('/login', login); //Handling post req to /api/auth/login


module.exports = router;
