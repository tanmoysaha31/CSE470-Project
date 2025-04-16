const User = require('../models/user');
const upload = require('../helpers/upload');
const {cloudinary, compressImage} = require('../helpers/imageUtils');

exports.uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: "No file uploaded!"});
        }
        
        //compress image
        const compressedBuffer = await compressImage(req.file.buffer);

        //upload to cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'compressed-profile-pics' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(compressedBuffer)
            
        });

        //update user in DB
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {profilePic: result.secure_url},
            {new: true}
        );

        res.status(200).json({
            success: true,
            profilePic: user.profilePic
        });
    }   catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
