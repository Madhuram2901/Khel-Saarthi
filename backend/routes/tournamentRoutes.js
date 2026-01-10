const express = require('express');
const router = express.Router();
const {
    createTournament,
    getTournaments,
    getTournamentById,
    updateTournament,
    publishTournament,
    addTeam,
    bulkAddTeams,
    getTeams,
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

// Public route for viewing by slug
router.get('/public/:slug', getTournamentBySlug);

// Tournament routes
router.route('/')
    .get(protect, getTournaments)
    .post(protect, createTournament);

router.route('/:id')
    .get(getTournamentById)
    .put(protect, updateTournament)
    .delete(protect, deleteTournament);

router.post('/:id/publish', protect, publishTournament);
router.post('/:id/share-link', protect, generateShareLink);

// Team routes
router.route('/:id/teams')
    .get(getTeams)
    .post(protect, addTeam);

router.post('/:id/teams/bulk', protect, bulkAddTeams);
router.route('/:tournamentId/teams/:teamId')
    .put(protect, updateTeam)
    .delete(protect, deleteTeam);

// Fixture generation
router.post('/:id/generate', protect, generateFixtures);

// Match routes
router.get('/:id/matches', getMatches);
router.get('/:id/standings', getStandings);

// Export
router.get('/:id/export/csv', exportCSV);

module.exports = router;
