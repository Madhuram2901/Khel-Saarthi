const express = require('express');
const router = express.Router();
const {
    getMatchById,
    updateMatch,
    enterResult,
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/authMiddleware');

// Match routes
router.route('/:id')
    .get(getMatchById)
    .put(protect, updateMatch);

router.post('/:id/result', protect, enterResult);

module.exports = router;
