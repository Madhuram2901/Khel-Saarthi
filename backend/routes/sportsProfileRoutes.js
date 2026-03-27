const express = require('express');
const router = express.Router();
const sportsProfileController = require('../controllers/sportsProfileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, sportsProfileController.getProfiles);
router.get('/:id', protect, sportsProfileController.getProfile);
router.post('/', protect, sportsProfileController.createProfile);
router.put('/:id', protect, sportsProfileController.updateProfile);
router.delete('/:id', protect, sportsProfileController.deleteProfile);

module.exports = router;
