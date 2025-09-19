const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const Event = require('../models/eventModel');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const fs = require('fs');

// @desc    Update user info (name, email, profile picture)
// @route   PUT /api/users/update
// @access  Private
const updateUserInfo = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Basic validation
    const { name, email } = req.body;
    const wantsNameChange = typeof name === 'string' && name !== user.name;
    const wantsEmailChange = typeof email === 'string' && email !== user.email;

    if (wantsNameChange && name.trim().length < 2) {
        res.status(400);
        throw new Error('Name must be at least 2 characters');
    }
    if (wantsEmailChange) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400);
            throw new Error('Invalid email format');
        }
        const emailTaken = await User.findOne({ email });
        if (emailTaken) {
            res.status(400);
            throw new Error('Email already in use');
        }
    }
    if (wantsNameChange) user.name = name;
    if (wantsEmailChange) user.email = email;

    // Handle profile picture upload (expects a file upload middleware to set req.file)
    if (req.file && req.file.path) {
        try {
            // If there is an existing picture, delete it first
            if (user.profilePicturePublicId) {
                await deleteFromCloudinary(user.profilePicturePublicId);
            }
            const { url, publicId } = await uploadToCloudinary(req.file.path, 'profile_pictures');
            user.profilePicture = url;
            user.profilePicturePublicId = publicId;
            // Remove local file after upload
            fs.unlinkSync(req.file.path);
        } catch (err) {
            res.status(500);
            throw new Error('Image upload failed: ' + err.message);
        }
    }

    const updatedUser = await user.save();
    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        profiles: updatedUser.profiles,
        token: generateToken(updatedUser._id),
    });
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400); // Bad Request
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    if (user) {
        res.status(201).json({ // 201 Created
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
});

// @desc    Get all events a user is registered for
// @route   GET /api/users/myevents
// @access  Private
const getMyEvents = asyncHandler(async (req, res) => {
    // Find all events where the registeredParticipants array contains the user's ID
    const events = await Event.find({ registeredParticipants: req.user._id });
    // Return just the IDs of those events
    const eventIds = events.map(event => event._id);
    res.json(eventIds);
});

// @desc    Update a user's sport profile
// @route   PUT /api/users/profile/badminton
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.profiles.badminton = {
            skillLevel: req.body.skillLevel || user.profiles.badminton.skillLevel,
            playstyle: req.body.playstyle || user.profiles.badminton.playstyle,
            height: req.body.height || user.profiles.badminton.height,
            weight: req.body.weight || user.profiles.badminton.weight,
            experience: req.body.experience || user.profiles.badminton.experience,
        };

        const updatedUser = await user.save();

        // Return the same data structure as login
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profiles: updatedUser.profiles, // Include the updated profiles
            token: generateToken(updatedUser._id), // Send a new token if needed
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});



const getMyProfile = asyncHandler(async (req, res) => {
    // Always fetch fresh user data from DB to include all fields
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        profiles: user.profiles,
    });
});

// @desc    Remove user's profile picture
// @route   DELETE /api/users/profile-picture
// @access  Private
const removeProfilePicture = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.profilePicturePublicId) {
        await deleteFromCloudinary(user.profilePicturePublicId);
    }
    user.profilePicture = '';
    user.profilePicturePublicId = '';
    await user.save();
    res.json({ message: 'Profile picture removed', profilePicture: '' });
});

module.exports = { registerUser, loginUser, getMyEvents, updateUserProfile, getMyProfile, updateUserInfo, removeProfilePicture };
