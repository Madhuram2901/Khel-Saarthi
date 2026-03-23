const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const Payment = require('../models/paymentModel');
const Tournament = require('../models/tournamentModel');
const Event = require('../models/eventModel');

// ============================================================
// Initialize Stripe with TEST keys from .env
// ============================================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================================
// @desc    Create a Stripe checkout session for joining a tournament/event
// @route   POST /api/payment/create-session
// @access  Private (requires auth token)
// ============================================================
const createSession = asyncHandler(async (req, res) => {
    const { amount, tournamentId, eventId, successUrl, failedUrl } = req.body;
    const itemId = tournamentId || eventId;
    const itemType = eventId ? 'EVENT' : 'TOURNAMENT';

    // --- Validation ---
    if (!amount || !itemId || !successUrl || !failedUrl) {
        res.status(400);
        throw new Error('Please provide amount, item ID, successUrl, and failedUrl');
    }

    // Check if item exists
    let itemName = 'Entry Fee';
    if (itemType === 'TOURNAMENT') {
        const tournament = await Tournament.findById(itemId);
        if (!tournament) {
            res.status(404);
            throw new Error('Tournament not found');
        }
        itemName = `Tournament Entry: ${tournament.name}`;
    } else {
        const eventItem = await Event.findById(itemId);
        if (!eventItem) {
            res.status(404);
            throw new Error('Event not found');
        }
        itemName = `Event Entry: ${eventItem.title}`;
    }

    // Check if user already has a successful payment for this item
    const paymentQuery = {
        user: req.user._id,
        status: 'SUCCESS',
    };
    if (itemType === 'EVENT') paymentQuery.event = itemId;
    else paymentQuery.tournament = itemId;

    const existingPayment = await Payment.findOne(paymentQuery);
    if (existingPayment) {
        res.status(400);
        throw new Error(`You have already paid for this ${itemType.toLowerCase()}`);
    }

    // --- Create Stripe Checkout Session ---
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
            price_data: {
                currency: 'inr',
                product_data: {
                    name: itemName
                },
                unit_amount: amount * 100 // Convert INR to paise
            },
            quantity: 1
        }],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: failedUrl,
        client_reference_id: req.user._id.toString(),
        metadata: {
            itemId: itemId,
            itemType: itemType,
            userId: req.user._id.toString(),
        }
    });

    // --- Save payment record in our database ---
    const paymentData = {
        user: req.user._id,
        itemType: itemType,
        sessionId: session.id,
        amount: amount,
        status: 'CREATED',
    };
    if (itemType === 'EVENT') paymentData.event = itemId;
    else paymentData.tournament = itemId;

    await Payment.create(paymentData);

    res.status(201).json({
        success: true,
        sessionId: session.id,
        paymentUrl: session.url,
        amount: amount,
    });
});

// ============================================================
// @desc    Verify Stripe payment status via session_id
// @route   POST /api/payment/verify
// @access  Private (requires auth token)
// ============================================================
const verifyPayment = asyncHandler(async (req, res) => {
    const { session_id, tournamentId, eventId } = req.body;
    const itemId = tournamentId || eventId;

    // --- Validation ---
    if (!session_id || !itemId) {
        res.status(400);
        throw new Error('Missing required payment verification fields');
    }

    // Retrieve the session securely from Stripe using the secret key
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // --- Find payment record ---
    const payment = await Payment.findOne({ sessionId: session_id });
    if (!payment) {
        res.status(404);
        throw new Error('Payment record not found');
    }

    if (session.payment_status === 'paid') {
        // ✅ Payment is valid — update status
        payment.status = 'SUCCESS';
        await payment.save();

        res.json({
            success: true,
            message: 'Payment verified successfully!',
            payment: {
                sessionId: payment.sessionId,
                amount: payment.amount,
                status: payment.status,
                itemType: payment.itemType
            },
        });
    } else {
        // ❌ Payment failed or not completed
        payment.status = 'FAILED';
        await payment.save();

        res.status(400);
        throw new Error('Payment verification failed. Payment was not completed.');
    }
});

// ============================================================
// @desc    Check if user has already paid for a tournament or event
// @route   GET /api/payment/status/:itemId
// @access  Private
// ============================================================
const getPaymentStatus = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const payment = await Payment.findOne({
        user: req.user._id,
        $or: [{ tournament: itemId }, { event: itemId }],
        status: 'SUCCESS',
    });

    res.json({
        hasPaid: !!payment,
        payment: payment || null,
    });
});

module.exports = {
    createSession,
    verifyPayment,
    getPaymentStatus,
};
