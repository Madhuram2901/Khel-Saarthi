const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMyEvents,
    updateUserProfile,
    getMyProfile,
    updateUserInfo,
    removeProfilePicture
} = require('../controllers/userController');
// For file uploads (profile picture)
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { protect } = require('../middleware/authMiddleware');
// Update user info (name, email, profile picture)
router.put('/update', protect, upload.single('profilePicture'), updateUserInfo);
// Remove user profile picture
router.delete('/profile-picture', protect, removeProfilePicture);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/myevents', protect, getMyEvents);
router.get('/profile', protect, getMyProfile);

// This line will now work correctly
router.put('/profile/badminton', protect, updateUserProfile);

module.exports = router;