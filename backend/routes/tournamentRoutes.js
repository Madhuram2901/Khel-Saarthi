const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createTournament,
    getTournaments,
    getMyTournaments,
    getTournamentById,
    updateTournament,
    publishTournament,
    registerTeamForTournament,
    addTeam,
    bulkAddTeams,
    getTeams,
    getMyTeamInTournament,
    deleteTeam,
    updateTeam,
    generateFixtures,
    getMatches,
    getMatchById,
    updateMatch,
    enterResult,
    getStandings,
    exportCSV,
    deleteTournament,
    getTournamentBySlug,
    generateShareLink,
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/authMiddleware');

// Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/teams/');
    },
    filename: (req, file, cb) => {
        cb(null, `team-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

// Public route for viewing by slug
router.get('/public/:slug', getTournamentBySlug);

// Tournament routes
router.route('/')
    .get(protect, getTournaments)
    .post(protect, createTournament);

router.get('/my', protect, getMyTournaments);

router.route('/:id')
    .get(getTournamentById)
    .put(protect, updateTournament)
    .delete(protect, deleteTournament);

router.post('/:id/publish', protect, publishTournament);
router.post('/:id/share-link', protect, generateShareLink);

// User team registration
router.post('/:id/register-team', protect, upload.single('logo'), registerTeamForTournament);
router.get('/:id/my-team', protect, getMyTeamInTournament);

// Team routes
router.route('/:id/teams')
    .get(getTeams)
    .post(protect, addTeam);

router.post('/:id/teams/bulk', protect, bulkAddTeams);
router.route('/:tournamentId/teams/:teamId')
    .put(protect, upload.single('logo'), updateTeam)
    .delete(protect, deleteTeam);

// Fixture generation
router.post('/:id/generate', protect, generateFixtures);

// Match routes
router.get('/:id/matches', getMatches);
router.get('/:id/standings', getStandings);

// Export
router.get('/:id/export/csv', exportCSV);

module.exports = router;
