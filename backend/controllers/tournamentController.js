const asyncHandler = require('express-async-handler');
const Tournament = require('../models/tournamentModel');
const Team = require('../models/teamModel');
const Match = require('../models/matchModel');
const Standing = require('../models/standingModel');
const {
    generateKnockoutFixtures,
    generateRoundRobinFixtures,
    generateGroupsKnockoutFixtures,
    updateStandings,
    advanceWinner,
} = require('../services/tournamentService');
const { nanoid } = require('nanoid');

// @desc    Create new tournament
// @route   POST /api/tournaments
// @access  Private
const createTournament = asyncHandler(async (req, res) => {
    const { name, sport, format, startDate, endDate, venues, isPublic } = req.body;

    if (!name || !sport || !format || !startDate || !endDate) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const tournament = await Tournament.create({
        name,
        sport,
        format,
        startDate,
        endDate,
        venues: venues || [],
        isPublic: isPublic || false,
        host: req.user._id,
        status: 'DRAFT',
        slug: nanoid(10),
    });

    res.status(201).json(tournament);
});

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
const getTournaments = asyncHandler(async (req, res) => {
    const tournaments = await Tournament.find({
        $or: [
            { host: req.user._id },
            { isPublic: true, status: 'PUBLISHED' }
        ]
    }).populate('host', 'name email').sort({ createdAt: -1 });

    res.json(tournaments);
});

// @desc    Get user's tournaments (where user is host)
// @route   GET /api/tournaments/my
// @access  Private
const getMyTournaments = asyncHandler(async (req, res) => {
    const tournaments = await Tournament.find({
        host: req.user._id
    }).populate('host', 'name email').sort({ createdAt: -1 });

    res.json(tournaments);
});

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
const getTournamentById = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id).populate('host', 'name email');

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    // Get teams
    const teams = await Team.find({ tournament: tournament._id }).populate('owner', 'name email');

    // Get matches
    const matches = await Match.find({ tournament: tournament._id })
        .populate('teamA', 'name logoUrl')
        .populate('teamB', 'name logoUrl')
        .sort({ matchNo: 1 });

    // Get standings
    const standings = await Standing.find({ tournament: tournament._id })
        .populate('team', 'name logoUrl')
        .sort({ points: -1, goalDifference: -1 });

    // Get user's team if logged in
    let myTeam = null;
    let isRegistered = false;
    let isHost = false;

    if (req.user) {
        myTeam = await Team.findOne({
            tournament: tournament._id,
            owner: req.user._id,
        }).populate('owner', 'name email');
        isRegistered = !!myTeam;
        isHost = tournament.host._id.toString() === req.user._id.toString();
    }

    res.json({
        tournament,
        teams,
        matches,
        standings,
        myTeam,
        isRegistered,
        isHost,
        teamsCount: teams.length,
        matchesCount: matches.length,
    });
});

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private
const updateTournament = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    // Check ownership
    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this tournament');
    }

    // Only allow updates if tournament is in DRAFT
    if (tournament.status !== 'DRAFT') {
        res.status(400);
        throw new Error('Cannot update published tournament. Unpublish first.');
    }

    const { name, sport, format, startDate, endDate, venues, isPublic } = req.body;

    tournament.name = name || tournament.name;
    tournament.sport = sport || tournament.sport;
    tournament.format = format || tournament.format;
    tournament.startDate = startDate || tournament.startDate;
    tournament.endDate = endDate || tournament.endDate;
    tournament.venues = venues !== undefined ? venues : tournament.venues;
    tournament.isPublic = isPublic !== undefined ? isPublic : tournament.isPublic;

    const updatedTournament = await tournament.save();
    res.json(updatedTournament);
});

// @desc    Publish tournament
// @route   POST /api/tournaments/:id/publish
// @access  Private
const publishTournament = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    // Check ownership
    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to publish this tournament');
    }

    tournament.status = tournament.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
    const updatedTournament = await tournament.save();

    res.json(updatedTournament);
});

// @desc    Register team for tournament (user)
// @route   POST /api/tournaments/:id/register-team
// @access  Private
const registerTeamForTournament = asyncHandler(async (req, res) => {
    console.log('REGISTER TEAM - User:', { id: req.user._id, role: req.user.role });
    console.log('REGISTER TEAM - Tournament ID:', req.params.id);
    console.log('REGISTER TEAM - Body:', req.body);
    console.log('REGISTER TEAM - File:', req.file);

    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
        console.log('REGISTER TEAM - Tournament not found');
        res.status(404);
        throw new Error('Tournament not found');
    }

    const { name } = req.body;
    const logoUrl = req.file ? `/uploads/teams/${req.file.filename}` : '';

    if (!name) {
        console.log('REGISTER TEAM - Team name missing');
        res.status(400);
        throw new Error('Team name is required');
    }

    // Parse players from FormData (sent as JSON string)
    let players = [];
    if (req.body.players) {
        if (typeof req.body.players === 'string') {
            players = JSON.parse(req.body.players);
        } else {
            players = req.body.players;
        }
    }

    // Check if user already has a team in this tournament
    const existingTeam = await Team.findOne({
        tournament: tournament._id,
        owner: req.user._id,
    });

    if (existingTeam) {
        console.log('REGISTER TEAM - User already has team:', existingTeam._id);
        res.status(400);
        throw new Error('You already have a team registered for this tournament');
    }

    // Create team with owner and players
    const team = await Team.create({
        name,
        logoUrl,
        players,
        owner: req.user._id,
        tournament: tournament._id,
    });

    console.log('REGISTER TEAM - Team created:', team._id);

    // Add team to tournament
    if (!tournament.teams) {
        tournament.teams = [];
    }
    tournament.teams.push(team._id);
    await tournament.save();

    console.log('REGISTER TEAM - Tournament updated with team');

    const populatedTeam = await Team.findById(team._id).populate('owner', 'name email');
    res.status(201).json(populatedTeam);
});

// @desc    Get user's team in tournament
// @route   GET /api/tournaments/:id/my-team
// @access  Private
const getMyTeamInTournament = asyncHandler(async (req, res) => {
    const team = await Team.findOne({
        tournament: req.params.id,
        owner: req.user._id,
    }).populate('owner', 'name email');

    res.json(team || null);
});

// @desc    Add team to tournament (host)
// @route   POST /api/tournaments/:id/teams
// @access  Private
const addTeam = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    // Check ownership
    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to add teams to this tournament');
    }

    const { name, logoUrl } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Team name is required');
    }

    const team = await Team.create({
        name,
        logoUrl: logoUrl || '',
        tournament: tournament._id,
    });

    // Add team to tournament
    if (!tournament.teams) {
        tournament.teams = [];
    }
    tournament.teams.push(team._id);
    await tournament.save();

    res.status(201).json(team);
});

// @desc    Bulk add teams
// @route   POST /api/tournaments/:id/teams/bulk
// @access  Private
const bulkAddTeams = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    // Check ownership
    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to add teams to this tournament');
    }

    const { teams } = req.body;

    if (!teams || !Array.isArray(teams) || teams.length === 0) {
        res.status(400);
        throw new Error('Please provide an array of team names');
    }

    const teamDocs = teams.map(teamName => ({
        name: teamName,
        tournament: tournament._id,
    }));

    const createdTeams = await Team.insertMany(teamDocs);

    // Add teams to tournament
    if (!tournament.teams) {
        tournament.teams = [];
    }
    tournament.teams.push(...createdTeams.map(t => t._id));
    await tournament.save();

    res.status(201).json(createdTeams);
});

// @desc    Get teams for tournament
// @route   GET /api/tournaments/:id/teams
// @access  Public
const getTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({ tournament: req.params.id });
    res.json(teams);
});

// @desc    Delete team
// @route   DELETE /api/tournaments/:tournamentId/teams/:teamId
// @access  Private (Host only)
const deleteTeam = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.tournamentId);

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    const team = await Team.findById(req.params.teamId);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    // Check authorization: only host can delete
    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only tournament host can delete teams');
    }

    // Remove team from tournament.teams array
    tournament.teams = tournament.teams.filter(
        (teamId) => teamId.toString() !== team._id.toString()
    );
    await tournament.save();

    // Remove team from future matches
    await Match.updateMany(
        {
            tournament: tournament._id,
            $or: [{ teamA: team._id }, { teamB: team._id }],
            status: 'SCHEDULED'
        },
        { status: 'CANCELLED' }
    );

    await team.deleteOne();
    res.json({ message: 'Team removed' });
});

// @desc    Update team name (host only)
// @route   PUT /api/tournaments/:tournamentId/teams/:teamId
// @access  Private (Host only)
const updateTeam = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.tournamentId);

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    const team = await Team.findById(req.params.teamId);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    // Check authorization: only host can update teams
    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only tournament host can update teams');
    }

    // Only allow updating team name
    const { name } = req.body;
    if (name) {
        team.name = name;
    }

    const updatedTeam = await team.save();
    const populatedTeam = await Team.findById(updatedTeam._id).populate('owner', 'name email');

    res.json(populatedTeam);
});

// @desc    Generate fixtures
// @route   POST /api/tournaments/:id/generate
// @access  Private
const generateFixtures = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    // Check ownership
    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to generate fixtures');
    }

    // Get all teams
    const teams = await Team.find({ tournament: tournament._id });

    if (teams.length < 2) {
        res.status(400);
        throw new Error('At least 2 teams are required');
    }

    // Check if fixtures already exist
    const existingMatches = await Match.find({ tournament: tournament._id });
    if (existingMatches.length > 0) {
        res.status(400);
        throw new Error('Fixtures already generated. Delete existing matches first.');
    }

    let matches;

    if (tournament.format === 'KNOCKOUT') {
        matches = await generateKnockoutFixtures(tournament._id, teams);
    } else if (tournament.format === 'ROUND_ROBIN') {
        matches = await generateRoundRobinFixtures(tournament._id, teams);
    } else if (tournament.format === 'GROUPS_PLUS_KNOCKOUT') {
        const { groups, topN } = req.body;

        if (!groups || typeof groups !== 'object') {
            res.status(400);
            throw new Error('Groups configuration is required for GROUPS_PLUS_KNOCKOUT format');
        }

        // Convert team IDs to team objects
        const groupsWithTeams = {};
        for (const [groupName, teamIds] of Object.entries(groups)) {
            groupsWithTeams[groupName] = teams.filter(team =>
                teamIds.includes(team._id.toString())
            );
        }

        matches = await generateGroupsKnockoutFixtures(
            tournament._id,
            groupsWithTeams,
            topN || 2
        );

        // Save groups to tournament
        tournament.groups = groups;
        tournament.topNFromGroups = topN || 2;
        await tournament.save();
    }

    res.status(201).json(matches);
});

// @desc    Get matches for tournament
// @route   GET /api/tournaments/:id/matches
// @access  Public
const getMatches = asyncHandler(async (req, res) => {
    const matches = await Match.find({ tournament: req.params.id })
        .populate('teamA', 'name logoUrl')
        .populate('teamB', 'name logoUrl')
        .sort({ matchNo: 1 });

    res.json(matches);
});

// @desc    Get match by ID
// @route   GET /api/matches/:id
// @access  Public
const getMatchById = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id)
        .populate('teamA', 'name logoUrl')
        .populate('teamB', 'name logoUrl')
        .populate('tournament', 'name sport format');

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    res.json(match);
});

// @desc    Update match
// @route   PUT /api/matches/:id
// @access  Private
const updateMatch = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id).populate('tournament');

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    const tournament = await Tournament.findById(match.tournament._id);

    // Check ownership
    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this match');
    }

    const { scheduledAt, durationMinutes, venue, status } = req.body;

    if (scheduledAt) match.scheduledAt = scheduledAt;
    if (durationMinutes) match.durationMinutes = durationMinutes;
    if (venue !== undefined) match.venue = venue;
    if (status) match.status = status;

    const updatedMatch = await match.save();
    res.json(updatedMatch);
});

// @desc    Enter match result
// @route   POST /api/matches/:id/result
// @access  Private
const enterResult = asyncHandler(async (req, res) => {
    const match = await Match.findById(req.params.id).populate('tournament');

    if (!match) {
        res.status(404);
        throw new Error('Match not found');
    }

    const tournament = await Tournament.findById(match.tournament._id);

    // Check ownership
    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to enter results');
    }

    const { scoreA, scoreB } = req.body;

    if (scoreA === undefined || scoreB === undefined) {
        res.status(400);
        throw new Error('Both scores are required');
    }

    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.status = 'FINISHED';

    await match.save();

    // Update standings if round-robin or group stage
    if (tournament.format === 'ROUND_ROBIN' || match.group) {
        await updateStandings(match);
    }

    // Advance winner if knockout
    if (tournament.format === 'KNOCKOUT' || (tournament.format === 'GROUPS_PLUS_KNOCKOUT' && !match.group)) {
        await advanceWinner(match);
    }

    const updatedMatch = await Match.findById(match._id)
        .populate('teamA', 'name logoUrl')
        .populate('teamB', 'name logoUrl');

    res.json(updatedMatch);
});

// @desc    Get standings
// @route   GET /api/tournaments/:id/standings
// @access  Public
const getStandings = asyncHandler(async (req, res) => {
    const standings = await Standing.find({ tournament: req.params.id })
        .populate('team', 'name logoUrl')
        .sort({ group: 1, points: -1, goalDifference: -1 });

    res.json(standings);
});

// @desc    Export fixtures as CSV
// @route   GET /api/tournaments/:id/export/csv
// @access  Public
const exportCSV = asyncHandler(async (req, res) => {
    const matches = await Match.find({ tournament: req.params.id })
        .populate('teamA', 'name')
        .populate('teamB', 'name')
        .sort({ matchNo: 1 });

    // Create CSV content
    let csv = 'Match ID,Round,Match No,Team A,Team B,Scheduled At,Venue,Status,Score A,Score B\n';

    matches.forEach(match => {
        csv += `${match._id},${match.round},${match.matchNo},`;
        csv += `${match.teamA?.name || 'TBD'},${match.teamB?.name || 'TBD'},`;
        csv += `${match.scheduledAt || ''},${match.venue || ''},${match.status},`;
        csv += `${match.scoreA !== null ? match.scoreA : ''},${match.scoreB !== null ? match.scoreB : ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=fixtures.csv');
    res.send(csv);
});

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private
const deleteTournament = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    // Check ownership
    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this tournament');
    }

    // Delete all related data
    await Team.deleteMany({ tournament: tournament._id });
    await Match.deleteMany({ tournament: tournament._id });
    await Standing.deleteMany({ tournament: tournament._id });
    await tournament.deleteOne();

    res.json({ message: 'Tournament deleted' });
});

// @desc    Get tournament by slug (Public)
// @route   GET /api/tournaments/public/:slug
// @access  Public
const getTournamentBySlug = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findOne({ slug: req.params.slug })
        .populate('host', 'name email');

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    // Fetch related data
    const teams = await Team.find({ tournament: tournament._id }).populate('owner', 'name email');
    const matches = await Match.find({ tournament: tournament._id })
        .populate('teamA')
        .populate('teamB');
    const standings = await Standing.find({ tournament: tournament._id })
        .populate('team')
        .sort({ points: -1, goalDifference: -1, goalsFor: -1 });

    // Get user's team if logged in
    let myTeam = null;
    let isRegistered = false;
    if (req.user) {
        myTeam = await Team.findOne({
            tournament: tournament._id,
            owner: req.user._id,
        }).populate('owner', 'name email');
        isRegistered = !!myTeam;
    }

    res.json({
        tournament,
        teams,
        matches,
        standings,
        myTeam,
        isRegistered,
    });
});

// @desc    Generate share link (slug) if missing
// @route   POST /api/tournaments/:id/share-link
// @access  Private
const generateShareLink = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    if (tournament.host.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    if (!tournament.slug) {
        tournament.slug = nanoid(10);
        await tournament.save();
    }

    res.json({
        slug: tournament.slug,
        shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tournament/${tournament.slug}`
    });
});

module.exports = {
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
};
