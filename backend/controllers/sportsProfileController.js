const SportsProfile = require('../models/sportsProfileModel');

// Helper function to convert skill level to label
const getSkillLabel = (level) => {
  if (level < 30) return 'Beginner';
  if (level < 70) return 'Intermediate';
  return 'Advanced';
};

// Get all sports profiles for the logged-in user
exports.getProfiles = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const profiles = await SportsProfile.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching sports profiles:', error);
    res.status(500).json({ message: 'Error fetching sports profiles', error: error.message });
  }
};

// Get a single sports profile
exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const profile = await SportsProfile.findOne({ _id: req.params.id, user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Sports profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching sports profile:', error);
    res.status(500).json({ message: 'Error fetching sports profile', error: error.message });
  }
};

// Create a new sports profile
exports.createProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { sportName, skillLevel, playstyle, experienceMonths, position, dominantSide } = req.body;

    // Validation
    if (!sportName || !playstyle || experienceMonths === undefined) {
      return res.status(400).json({ message: 'Missing required fields: sportName, playstyle, experienceMonths' });
    }

    // Check if profile for same sport already exists
    const existingProfile = await SportsProfile.findOne({
      user: req.user._id,
      sportName: { $regex: `^${sportName}$`, $options: 'i' },
    });

    if (existingProfile) {
      return res.status(400).json({ message: `Profile for ${sportName} already exists` });
    }

    const newProfile = new SportsProfile({
      user: req.user._id,
      sportName,
      skillLevel: skillLevel || 0,
      playstyle,
      experienceMonths: parseInt(experienceMonths),
      position: position || null,
      dominantSide: dominantSide || null,
    });

    await newProfile.save();

    res.status(201).json({
      message: 'Sports profile created successfully',
      profile: newProfile,
    });
  } catch (error) {
    console.error('Error creating sports profile:', error);
    res.status(500).json({ message: 'Error creating sports profile', error: error.message });
  }
};

// Update a sports profile
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { sportName, skillLevel, playstyle, experienceMonths, position, dominantSide } = req.body;

    // Validation
    if (!sportName || !playstyle || experienceMonths === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if profile exists
    const profile = await SportsProfile.findOne({ _id: id, user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Sports profile not found' });
    }

    // Check if another profile with same sport name exists
    if (sportName.toLowerCase() !== profile.sportName.toLowerCase()) {
      const existingProfile = await SportsProfile.findOne({
        user: req.user._id,
        _id: { $ne: id },
        sportName: { $regex: `^${sportName}$`, $options: 'i' },
      });

      if (existingProfile) {
        return res.status(400).json({ message: `Profile for ${sportName} already exists` });
      }
    }

    // Update fields
    profile.sportName = sportName;
    profile.skillLevel = skillLevel || 0;
    profile.playstyle = playstyle;
    profile.experienceMonths = parseInt(experienceMonths);
    profile.position = position || null;
    profile.dominantSide = dominantSide || null;

    await profile.save();

    res.json({
      message: 'Sports profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Error updating sports profile:', error);
    res.status(500).json({ message: 'Error updating sports profile', error: error.message });
  }
};

// Delete a sports profile
exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const profile = await SportsProfile.findOneAndDelete({ _id: id, user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Sports profile not found' });
    }

    res.json({ message: 'Sports profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting sports profile:', error);
    res.status(500).json({ message: 'Error deleting sports profile', error: error.message });
  }
};
