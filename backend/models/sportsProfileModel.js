const mongoose = require('mongoose');

const sportsProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sportName: {
      type: String,
      required: true,
      trim: true,
    },
    skillLevel: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    playstyle: {
      type: String,
      required: true,
      trim: true,
    },
    experienceMonths: {
      type: Number,
      required: true,
      min: 0,
    },
    position: {
      type: String,
      trim: true,
    },
    dominantSide: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
sportsProfileSchema.index({ user: 1 });

module.exports = mongoose.model('SportsProfile', sportsProfileSchema);
