const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');
const Message = require('../models/messageModel');

const getAllEvents = asyncHandler(async (req, res) => {
    const { category, skillLevel, maxFee, search, startDate, endDate } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (skillLevel) filter.skillLevel = skillLevel;
    if (maxFee) filter.entryFee = { $lte: parseInt(maxFee) };
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }
    const events = await Event.find(filter).populate('host', 'name');
    res.json(events);
});

const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate('host', 'name email');
    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category, skillLevel, entryFee } = req.body;
    if (req.user.role !== 'host') {
        res.status(403);
        throw new Error('User is not a host');
    }
    const event = new Event({ title, description, date, location, category, skillLevel, entryFee, host: req.user._id });
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
});

const updateEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category, skillLevel, entryFee } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    if (event.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('User not authorized to update this event');
    }
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    event.category = category || event.category;
    event.skillLevel = skillLevel || event.skillLevel;
    event.entryFee = entryFee !== undefined ? entryFee : event.entryFee;
    const updatedEvent = await event.save();
    res.json(updatedEvent);
});

const registerForEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (event) {
        if (event.host.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('Hosts cannot register for their own event');
        }
        if (event.registeredParticipants.includes(req.user._id)) {
            res.status(400);
            throw new Error('User already registered for this event');
        }
        event.registeredParticipants.push(req.user._id);
        await event.save();
        res.json({ message: 'Registered for event successfully' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

const getEventParticipants = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate('registeredParticipants', 'name email');
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }
    if (event.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('User is not authorized to view participants');
    }
    res.json(event.registeredParticipants);
});

const getChatHistory = asyncHandler(async (req, res) => {
    const messages = await Message.find({ event: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
});

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    registerForEvent,
    getEventParticipants,
    getChatHistory,
};