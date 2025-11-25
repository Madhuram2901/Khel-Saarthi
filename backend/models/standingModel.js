const mongoose = require('mongoose');

const standingSchema = mongoose.Schema(
    {
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Tournament',
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Team',
        },
        group: {
            type: String,
            default: null,
        },
        played: {
            type: Number,
            default: 0,
        },
        won: {
            type: Number,
            default: 0,
        },
        lost: {
            type: Number,
            default: 0,
        },
        draw: {
            type: Number,
            default: 0,
        },
        goalsFor: {
            type: Number,
            default: 0,
        },
        goalsAgainst: {
            type: Number,
            default: 0,
        },
        goalDifference: {
            type: Number,
            default: 0,
        },
        points: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Standing = mongoose.model('Standing', standingSchema);
module.exports = Standing;
