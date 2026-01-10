const mongoose = require('mongoose');

const matchSchema = mongoose.Schema(
    {
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Tournament',
        },
        round: {
            type: String,
            required: true,
        },
        matchNo: {
            type: Number,
            required: true,
        },
        teamA: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null,
        },
        teamB: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null,
        },
        scheduledAt: {
            type: Date,
            default: null,
        },
        durationMinutes: {
            type: Number,
            default: 90,
        },
        venue: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['SCHEDULED', 'IN_PROGRESS', 'FINISHED', 'POSTPONED', 'CANCELLED'],
            default: 'SCHEDULED',
        },
        scoreA: {
            type: Number,
            default: null,
        },
        scoreB: {
            type: Number,
            default: null,
        },
        nextMatchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match',
            default: null,
        },
        group: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
