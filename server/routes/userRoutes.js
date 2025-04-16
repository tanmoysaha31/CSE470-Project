//Route for updating user profile
router.put('/profile/:id',auth, userController.updateProfile);
