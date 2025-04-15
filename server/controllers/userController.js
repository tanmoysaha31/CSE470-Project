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
    }
}