const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');

//Cloudinary config for cloud storage
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, //for cloud
    api_key: process.env.CLOUDINARY_API_KEY, //for cloudinary account
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//Image compression handle
const compressImage = async (buffer) => {
    return await sharp(buffer)
        .resize(500, 500, { fit: 'inside'}) //resize max to 500x500
        .jpeg({quality: 80}) //convert jpeg to 80% quality
        .toBuffer(); 
};

module.exports = {cloudinary, compressImage};
