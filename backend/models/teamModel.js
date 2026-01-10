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
