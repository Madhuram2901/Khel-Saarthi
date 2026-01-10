const mongoose = require('mongoose');

const tournamentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        sport: {
            type: String,
            required: true,
        },
        format: {
            type: String,
            required: true,
            enum: ['KNOCKOUT', 'ROUND_ROBIN', 'GROUPS_PLUS_KNOCKOUT'],
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['DRAFT', 'PUBLISHED'],
            default: 'DRAFT',
        },
        venues: [{
            type: String,
        }],
        isPublic: {
            type: Boolean,
            default: false,
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        groups: {
            type: Map,
            of: [mongoose.Schema.Types.ObjectId],
            default: new Map(),
        },
        topNFromGroups: {
            type: Number,
            default: 2,
        },
        slug: {
            type: String,
            unique: true,
            sparse: true,
        },
        shareUrl: {
            type: String,
        },
    },
    { timestamps: true }
);

const Tournament = mongoose.model('Tournament', tournamentSchema);
module.exports = Tournament;
