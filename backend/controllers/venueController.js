const asyncHandler = require('express-async-handler');
const Venue = require('../models/venueModel');
const Booking = require('../models/bookingModel');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const fs = require('fs');

// @desc    Create a new venue
// @route   POST /api/venues
// @access  Private (Manager/Admin)
const createVenue = asyncHandler(async (req, res) => {
    let { name, description, address, city, state, location, sportTypes, pricePerHour, amenities, availability } = req.body;

    // Check permissions
    if (
        req.user.role !== 'venue_manager' &&
        req.user.role !== 'admin' &&
        req.user.role !== 'host'
    ) {
        res.status(403);
        throw new Error('Not authorized to create venues');
    }

    // Parse JSON strings if coming from FormData
    if (typeof location === 'string') location = JSON.parse(location);
    if (typeof sportTypes === 'string') sportTypes = JSON.parse(sportTypes);
    if (typeof amenities === 'string') amenities = JSON.parse(amenities);
    if (typeof availability === 'string') availability = JSON.parse(availability);

    let images = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            try {
                const { url } = await uploadToCloudinary(file.path, 'venue_images');
                images.push(url);
                fs.unlinkSync(file.path);
            } catch (error) {
                console.error('Image upload failed', error);
            }
        }
    }

    const venue = await Venue.create({
        name,
        description,
        address,
        city,
        state,
        location,
        sportTypes,
        pricePerHour,
        amenities,
        availability,
        images,
        manager: req.user._id
    });

    res.status(201).json(venue);
});

// @desc    Get all venues with filters
// @route   GET /api/venues
// @access  Public
const getVenues = asyncHandler(async (req, res) => {
    const { city, sport, minPrice, maxPrice, lat, lng, radius } = req.query;

    let filter = {};

    if (city) filter.city = { $regex: city, $options: 'i' };
    if (sport) filter.sportTypes = { $in: [sport] };

    if (minPrice || maxPrice) {
        filter.pricePerHour = {};
        if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
        if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }

    // Geospatial query if lat/lng provided
    if (lat && lng) {
        const distanceInMeters = (radius || 10) * 1000; // Default 10km
        filter.location = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                $maxDistance: distanceInMeters
            }
        };
    }

    const venues = await Venue.find(filter).populate('manager', 'name email');
    res.json(venues);
});

// @desc    Get venue by ID
// @route   GET /api/venues/:id
// @access  Public
const getVenueById = asyncHandler(async (req, res) => {
    const venue = await Venue.findById(req.params.id).populate('manager', 'name email');
    if (venue) {
        res.json(venue);
    } else {
        res.status(404);
        throw new Error('Venue not found');
    }
});

// @desc    Create a booking
// @route   POST /api/venues/:id/book
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    let { date, startTime, duration } = req.body;
    const venueId = req.params.id;

    const venue = await Venue.findById(venueId);
    if (!venue) {
        res.status(404);
        throw new Error('Venue not found');
    }

    // Calculate endTime
    // Format: "14:00" -> hours=14, mins=0
    const [startHour, startMin] = startTime.split(':').map(Number);
    const endHour = startHour + parseInt(duration);
    const endTime = `${endHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;

    const totalAmount = venue.pricePerHour * parseInt(duration);

    // Check for overlap
    // Overlap condition: (StartA < EndB) and (EndA > StartB)
    const existingBooking = await Booking.findOne({
        venue: venueId,
        date: date, // String comparison "YYYY-MM-DD" is safer if consistent
        status: { $ne: 'cancelled' },
        $or: [
            // New booking starts during an existing booking
            {
                startTime: { $lte: startTime },
                endTime: { $gt: startTime }
            },
            // New booking ends during an existing booking
            {
                startTime: { $lt: endTime },
                endTime: { $gte: endTime }
            },
            // New booking completely covers an existing booking
            {
                startTime: { $gte: startTime },
                endTime: { $lte: endTime }
            }
        ]
    });

    if (existingBooking) {
        res.status(400);
        throw new Error('Slot already booked');
    }

    const booking = await Booking.create({
        venue: venueId,
        user: req.user._id,
        date,
        startTime,
        endTime,
        durationHours: duration,
        totalAmount,
        status: 'confirmed'
    });

    res.status(201).json(booking);
});

// @desc    Get my bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate('venue', 'name description address city sportTypes pricePerHour images rating')
        .sort({ date: -1, startTime: -1 }); // Sort by date descending (most recent first)
    res.json(bookings);
});

// @desc    Update venue
// @route   PUT /api/venues/:id
// @access  Private (Manager only)
const updateVenue = asyncHandler(async (req, res) => {
    let { name, description, address, city, state, location, sportTypes, pricePerHour, amenities, availability } = req.body;
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
        res.status(404);
        throw new Error('Venue not found');
    }

    // Check ownership
    if (
        venue.manager.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' &&
        req.user.role !== 'host'
    ) {
        res.status(403);
        throw new Error('Not authorized to update this venue');
    }

    // Parse JSON strings if coming from FormData
    if (typeof location === 'string') location = JSON.parse(location);
    if (typeof sportTypes === 'string') sportTypes = JSON.parse(sportTypes);
    if (typeof amenities === 'string') amenities = JSON.parse(amenities);
    if (typeof availability === 'string') availability = JSON.parse(availability);

    // Handle Image Upload (Replace existing or add new - simplified to append for now)
    let images = venue.images;
    if (req.files && req.files.length > 0) {
        // Optionally clear old images here if you want single image policy
        // images = []; 
        for (const file of req.files) {
            try {
                const { url } = await uploadToCloudinary(file.path, 'venue_images');
                // For now, let's replace the first image if it exists, or push
                if (images.length > 0) {
                    images[0] = url; // Simple replace logic for single image UI
                } else {
                    images.push(url);
                }
                fs.unlinkSync(file.path);
            } catch (error) {
                console.error('Image upload failed', error);
            }
        }
    }

    venue.name = name || venue.name;
    venue.description = description || venue.description;
    venue.address = address || venue.address;
    venue.city = city || venue.city;
    venue.state = state || venue.state;
    venue.location = location || venue.location;
    venue.sportTypes = sportTypes || venue.sportTypes;
    venue.pricePerHour = pricePerHour || venue.pricePerHour;
    venue.amenities = amenities || venue.amenities;
    venue.availability = availability || venue.availability;
    venue.images = images;

    const updatedVenue = await venue.save();
    res.json(updatedVenue);
});

// @desc    Get bookings for venues managed by current user (Host)
// @route   GET /api/venues/bookings/host
// @access  Private (Manager only)
const getHostBookings = asyncHandler(async (req, res) => {
    // 1. Find all venues managed by this user
    const venues = await Venue.find({ manager: req.user._id });
    const venueIds = venues.map(v => v._id);

    // 2. Find all bookings for these venues
    const bookings = await Booking.find({ venue: { $in: venueIds } })
        .populate('venue', 'name address images')
        .populate('user', 'name email profilePicture')
        .sort({ date: -1 });

    res.json(bookings);
});

// @desc    Get venues managed by current user
// @route   GET /api/venues/my-venues
// @access  Private
const getMyVenues = asyncHandler(async (req, res) => {
    const venues = await Venue.find({ manager: req.user._id })
        .populate('manager', 'name email');
    res.json(venues);
});

module.exports = {
    createVenue,
    getVenues,
    getVenueById,
    updateVenue,
    createBooking,
    getMyBookings,
    getHostBookings,
    getMyVenues
};
