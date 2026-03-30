const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    createVenue,
    getVenues,
    getVenueById,
    updateVenue,
    createBooking,
    getHostBookings,
    getMyVenues
} = require('../controllers/venueController');
const { protect } = require('../middleware/authMiddleware');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for venue images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `venue-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

router.route('/')
    .get(getVenues)
    .post(protect, upload.array('images', 5), createVenue);

router.route('/bookings/host')
    .get(protect, getHostBookings);

router.get('/my-venues', protect, getMyVenues);

router.route('/:id')
    .get(getVenueById)
    .put(protect, upload.array('images', 5), updateVenue);

router.route('/:id/book').post(protect, createBooking);

module.exports = router;
