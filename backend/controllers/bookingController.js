const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const Venue = require('../models/venueModel');
const User = require('../models/userModel');

const parseBookingDateTime = (date, time = '00:00') => {
    const safeTime = time || '00:00';
    return new Date(`${date}T${safeTime}:00`);
};

const createBookingPayload = ({ venue, userId, date, startTime = '00:00', duration = 1, endDate }) => {
    const durationHours = Math.max(Number(duration) || 1, 1);
    const startDate = parseBookingDateTime(date, startTime);
    const computedEndDate = endDate
        ? parseBookingDateTime(endDate, startTime)
        : new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000));

    const displayEndTime = computedEndDate.toISOString().slice(11, 16);
    const totalPrice = (venue.pricePerHour || 0) * durationHours;

    return {
        venue: venue._id,
        user: userId,
        startDate,
        endDate: computedEndDate,
        date: startDate,
        startTime,
        endTime: displayEndTime,
        durationHours,
        totalAmount: totalPrice,
        totalPrice,
        status: venue.autoApprove ? 'confirmed' : 'pending',
    };
};

const findOverlappingBooking = async ({ venueId, startDate, endDate }) => Booking.findOne({
    venue: venueId,
    status: { $ne: 'cancelled' },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
});

// @desc    Create a booking
// @route   POST /api/bookings
// @route   POST /api/venues/:id/book
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const venueId = req.params.id || req.body.venueId;
    const { date, startTime, duration, endDate } = req.body;

    if (!venueId || !date) {
        res.status(400);
        throw new Error('Venue and booking date are required');
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
        res.status(404);
        throw new Error('Venue not found');
    }

    const bookingPayload = createBookingPayload({
        venue,
        userId: req.user._id,
        date,
        startTime,
        duration,
        endDate,
    });

    const overlappingBooking = await findOverlappingBooking({
        venueId,
        startDate: bookingPayload.startDate,
        endDate: bookingPayload.endDate,
    });

    if (overlappingBooking) {
        res.status(400);
        throw new Error('Venue not available for the selected dates');
    }

    const booking = await Booking.create(bookingPayload);

    await Promise.all([
        User.findByIdAndUpdate(req.user._id, { $addToSet: { bookings: booking._id } }),
        Venue.findByIdAndUpdate(venueId, { $addToSet: { bookings: booking._id } }),
    ]);

    const populatedBooking = await Booking.findById(booking._id).populate('venue');
    res.status(201).json(populatedBooking);
});

// @desc    Get my bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate('venue', 'name description address city sportTypes pricePerHour images rating')
        .sort({ startDate: -1 });

    res.json(bookings);
});

module.exports = {
    createBooking,
    getMyBookings,
    findOverlappingBooking,
};
