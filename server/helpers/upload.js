const multer = require('multer');
const {cloudinary} = require('./imageUtils');

const storage = new multer.memoryStorage(); //storage file in memory for compression
const upload = multer({storage});

module.exports = upload;

