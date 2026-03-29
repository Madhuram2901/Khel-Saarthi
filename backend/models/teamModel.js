const mongoose = require('mongoose');

const teamSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        logoUrl: {
            type: String,
            default: '',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        players: [
            {
                name: String,
                role: String,
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
            },
        ],
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Tournament',
        },
        group: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
