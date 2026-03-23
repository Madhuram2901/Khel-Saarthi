const mongoose = require('mongoose');

// ============================================================
// Payment Model
// ============================================================
// Stores every Stripe checkout session attempt.
// Status flow: CREATED → SUCCESS or FAILED
// ============================================================

const paymentSchema = mongoose.Schema(
    {
        // Who made the payment
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },

        // Which tournament the payment is for
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Tournament',
        },

        // Which event the payment is for
        event: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Event',
        },

        itemType: {
            type: String,
            enum: ['TOURNAMENT', 'EVENT'],
            required: true,
            default: 'TOURNAMENT'
        },

        // Stripe Session ID (starts with "cs_")
        sessionId: {
            type: String,
            required: true,
            unique: true,
        },

        // Amount in INR (not paise) — for display purposes
        amount: {
            type: Number,
            required: true,
        },

        // Payment status
        status: {
            type: String,
            enum: ['CREATED', 'SUCCESS', 'FAILED'],
            default: 'CREATED',
        },
    },
    { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
