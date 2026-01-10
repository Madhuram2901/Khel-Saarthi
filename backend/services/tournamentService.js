const Match = require('../models/matchModel');
const Standing = require('../models/standingModel');

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generate knockout fixtures
 * Creates a bracket structure with rounds
 * Properly handles any number of teams including byes
 */
async function generateKnockoutFixtures(tournamentId, teams) {
    if (teams.length < 2) {
        throw new Error('At least 2 teams are required for knockout tournament');
    }

    // Shuffle teams for random seeding
    const shuffledTeams = shuffleArray(teams);
    const totalTeams = shuffledTeams.length;

    // Find the next power of 2 (final bracket size)
    const finalBracketSize = Math.pow(2, Math.ceil(Math.log2(totalTeams)));
    const totalRounds = Math.log2(finalBracketSize);

    // Calculate how many teams get byes (skip first round)
    const byes = finalBracketSize - totalTeams;
    const firstRoundTeams = totalTeams - byes;
    const firstRoundMatches = firstRoundTeams / 2;

    const allMatches = [];
    let matchNo = 1;

    // Build matches round by round
    const roundMatches = [];

    // Round 1 (if needed - teams without byes play here)
    if (firstRoundMatches > 0) {
        const round1 = [];
        for (let i = 0; i < firstRoundMatches; i++) {
            round1.push({
                tournament: tournamentId,
                round: getRoundName(totalRounds, totalRounds),
                matchNo: matchNo++,
                teamA: shuffledTeams[i * 2]._id,
                teamB: shuffledTeams[i * 2 + 1]._id,
                status: 'SCHEDULED',
            });
        }
        roundMatches.push(round1);
    }

    // Calculate remaining rounds
    let teamsInNextRound = byes + firstRoundMatches;
    let currentRound = totalRounds - 1;

    while (teamsInNextRound > 1) {
        const matchesInRound = teamsInNextRound / 2;
        const round = [];

        for (let i = 0; i < matchesInRound; i++) {
            round.push({
                tournament: tournamentId,
                round: getRoundName(currentRound, totalRounds),
                matchNo: matchNo++,
                teamA: null,
                teamB: null,
                status: 'SCHEDULED',
            });
        }

        roundMatches.push(round);
        teamsInNextRound = matchesInRound;
        currentRound--;
    }

    // Flatten all matches
    for (const round of roundMatches) {
        allMatches.push(...round);
    }

    // Save all matches
    const savedMatches = await Match.insertMany(allMatches);

    // Link matches for progression
    await linkKnockoutMatchesNew(savedMatches, roundMatches.length, byes, shuffledTeams);

    return savedMatches;
}

/**
 * Get round name based on round number
 */
function getRoundName(roundNum, totalRounds) {
    const roundsFromEnd = totalRounds - roundNum + 1;

    if (roundsFromEnd === 1) return 'Final';
    if (roundsFromEnd === 2) return 'Semi-Final';
    if (roundsFromEnd === 3) return 'Quarter-Final';
    if (roundsFromEnd === 4) return 'Round of 16';

    return `Round ${roundNum}`;
}

/**
 * Link knockout matches so winners advance to next round
 * Also handles teams with byes
 */
async function linkKnockoutMatchesNew(matches, numRounds, byes, teams) {
    let matchIndex = 0;

    // Calculate matches per round
    const matchesPerRound = [];
    let currentIndex = 0;

    for (let r = 0; r < numRounds; r++) {
        const roundSize = matches.filter(m => m.round === matches[currentIndex]?.round).length;
        matchesPerRound.push({ start: currentIndex, size: roundSize });
        currentIndex += roundSize;
    }

    // Link each round to the next
    for (let r = 0; r < numRounds - 1; r++) {
        const currentRound = matchesPerRound[r];
        const nextRound = matchesPerRound[r + 1];

        for (let i = 0; i < currentRound.size; i++) {
            const currentMatch = matches[currentRound.start + i];
            const nextMatchIndex = Math.floor(i / 2);
            const nextMatch = matches[nextRound.start + nextMatchIndex];

            if (nextMatch) {
                currentMatch.nextMatchId = nextMatch._id;
                await currentMatch.save();
            }
        }
    }

    // Handle byes - teams that skip first round go directly to round 2
    if (byes > 0 && numRounds > 1) {
        const firstRoundMatches = matchesPerRound[0].size;
        const byeTeams = teams.slice(firstRoundMatches * 2); // Teams that get byes

        const secondRound = matchesPerRound[1];
        let byeIndex = 0;

        // Place bye teams in second round matches
        for (let i = 0; i < secondRound.size && byeIndex < byeTeams.length; i++) {
            const match = matches[secondRound.start + i];

            // Check if this match should receive bye teams
            // Byes fill from the top of the bracket
            if (i < byes) {
                if (!match.teamA) {
                    match.teamA = byeTeams[byeIndex]._id;
                    await match.save();
                    byeIndex++;
                }
            }
        }
    }
}

/**
 * Generate round-robin fixtures
 * Every team plays every other team once
 */
async function generateRoundRobinFixtures(tournamentId, teams) {
    if (teams.length < 2) {
        throw new Error('At least 2 teams are required for round-robin tournament');
    }

    const matches = [];
    let matchNo = 1;

    // Create standings for all teams
    const standings = teams.map(team => ({
        tournament: tournamentId,
        team: team._id,
        played: 0,
        won: 0,
        lost: 0,
        draw: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
    }));

    await Standing.insertMany(standings);

    // Generate all possible pairings
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            matches.push({
                tournament: tournamentId,
                round: 'Round Robin',
                matchNo: matchNo++,
                teamA: teams[i]._id,
                teamB: teams[j]._id,
                status: 'SCHEDULED',
            });
        }
    }

    const savedMatches = await Match.insertMany(matches);
    return savedMatches;
}

/**
 * Generate group stage + knockout fixtures
 */
async function generateGroupsKnockoutFixtures(tournamentId, groups, topN = 2) {
    const matches = [];
    let matchNo = 1;

    // Generate round-robin for each group
    for (const [groupName, teams] of Object.entries(groups)) {
        if (teams.length < 2) {
            throw new Error(`Group ${groupName} must have at least 2 teams`);
        }

        // Create standings for teams in this group
        const standings = teams.map(team => ({
            tournament: tournamentId,
            team: team._id,
            group: groupName,
            played: 0,
            won: 0,
            lost: 0,
            draw: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
        }));

        await Standing.insertMany(standings);

        // Generate round-robin matches for this group
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                matches.push({
                    tournament: tournamentId,
                    round: `Group ${groupName}`,
                    matchNo: matchNo++,
                    teamA: teams[i]._id,
                    teamB: teams[j]._id,
                    group: groupName,
                    status: 'SCHEDULED',
                });
            }
        }
    }

    // Save group stage matches
    await Match.insertMany(matches);

    // Create knockout bracket structure (empty slots to be filled by group winners)
    const numGroups = Object.keys(groups).length;
    const knockoutTeams = numGroups * topN;
    const knockoutRounds = Math.ceil(Math.log2(knockoutTeams));

    const knockoutMatches = [];
    let knockoutMatchNo = matchNo;

    // Create knockout rounds
    let previousRoundMatches = Math.ceil(knockoutTeams / 2);
    for (let r = knockoutRounds; r >= 1; r--) {
        const roundName = getRoundName(r, knockoutRounds);

        for (let i = 0; i < previousRoundMatches; i++) {
            knockoutMatches.push({
                tournament: tournamentId,
                round: roundName,
                matchNo: knockoutMatchNo++,
                teamA: null,
                teamB: null,
                status: 'SCHEDULED',
            });
        }
        previousRoundMatches = Math.ceil(previousRoundMatches / 2);
    }

    const savedKnockoutMatches = await Match.insertMany(knockoutMatches);
    await linkKnockoutMatchesNew(savedKnockoutMatches, knockoutRounds, 0, []);

    return [...matches, ...knockoutMatches];
}

/**
 * Update standings after a match result
 */
async function updateStandings(match) {
    if (match.scoreA === null || match.scoreB === null) {
        return;
    }

    const standingA = await Standing.findOne({
        tournament: match.tournament,
        team: match.teamA,
    });

    const standingB = await Standing.findOne({
        tournament: match.tournament,
        team: match.teamB,
    });

    if (!standingA || !standingB) {
        return; // Knockout matches don't have standings
    }

    // Update played
    standingA.played += 1;
    standingB.played += 1;

    // Update goals
    standingA.goalsFor += match.scoreA;
    standingA.goalsAgainst += match.scoreB;
    standingB.goalsFor += match.scoreB;
    standingB.goalsAgainst += match.scoreA;

    // Update goal difference
    standingA.goalDifference = standingA.goalsFor - standingA.goalsAgainst;
    standingB.goalDifference = standingB.goalsFor - standingB.goalsAgainst;

    // Determine winner and update points
    if (match.scoreA > match.scoreB) {
        standingA.won += 1;
        standingA.points += 3;
        standingB.lost += 1;
    } else if (match.scoreB > match.scoreA) {
        standingB.won += 1;
        standingB.points += 3;
        standingA.lost += 1;
    } else {
        standingA.draw += 1;
        standingB.draw += 1;
        standingA.points += 1;
        standingB.points += 1;
    }

    await standingA.save();
    await standingB.save();
}

/**
 * Advance winner in knockout match
 */
async function advanceWinner(match) {
    if (!match.nextMatchId || match.scoreA === null || match.scoreB === null) {
        return;
    }

    const winnerId = match.scoreA > match.scoreB ? match.teamA : match.teamB;
    const nextMatch = await Match.findById(match.nextMatchId);

    if (!nextMatch) {
        return;
    }

    // Place winner in next match
    if (!nextMatch.teamA) {
        nextMatch.teamA = winnerId;
    } else if (!nextMatch.teamB) {
        nextMatch.teamB = winnerId;
    }

    await nextMatch.save();
}

module.exports = {
    generateKnockoutFixtures,
    generateRoundRobinFixtures,
    generateGroupsKnockoutFixtures,
    updateStandings,
    advanceWinner,
};
