//Profile Update

exports.updateProfile = async( req,res ) =>{
    try {
        const{ id } = req.params;

        //user existance checking
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found"});
        }

        //verify user is updating own profile or is admin
        if (req.user.id !== id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorised profile update"});
        }

        //Fields that are allowed to be updated
        const allowedUpdates = [
            'name',
            'email',
            'password',
            'bio',
            'address',
            //We can edit and add more
        ];

        //Filter out fields that are not allowed to be updated
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });


        //Update user profile
        const updateUser = await User.findIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password'); //

        res.status(200).json({
            success: true,
            data: updateUser
        });
    }   catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message 
        });
    }
};