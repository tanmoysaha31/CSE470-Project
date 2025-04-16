const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const upload = require('../helpers/upload');

//Protect all routes
router.use(authController.protect);

//Profile pic upload with compression
router.patch(
    '/upload-profile-pic',
    upload.single('profilePic'), // 'profilePic' must match frontend field name
    userController.uploadProfilePic
);


module.exports = router;
