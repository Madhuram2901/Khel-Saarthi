// ============================================================
// Payment Service
// ============================================================
// Handles all Stripe payment API calls from the frontend.
// Uses the shared `api` instance which already has the auth
// token attached in the headers.
// ============================================================

import api from '../api/api';

/**
 * Create a Stripe session on the backend
 * 
 * @param {number} amount - Amount in INR (e.g., 500 for ₹500)
 * @param {string} tournamentId - MongoDB ID of the tournament (optional)
 * @param {string} eventId - MongoDB ID of the event (optional)
 * @param {string} successUrl - App deep link for success
 * @param {string} failedUrl - App deep link for failure
 * @returns {Object} { success, sessionId, paymentUrl, amount }
 */
export const createPaymentSession = async (amount, tournamentId, eventId, successUrl, failedUrl) => {
    const { data } = await api.post('/payment/create-session', {
        amount,
        tournamentId,
        eventId,
        successUrl,
        failedUrl,
    });
    return data;
};

/**
 * Verify payment on the backend after Stripe checkout completes
 * 
 * @param {Object} params - Payment verification params
 * @param {string} params.session_id - Stripe Checkout session ID
 * @param {string} params.tournamentId - MongoDB ID of the tournament (optional)
 * @param {string} params.eventId - MongoDB ID of the event (optional)
 * @returns {Object} { success, message, payment }
 */
export const verifyPayment = async ({ session_id, tournamentId, eventId }) => {
    const { data } = await api.post('/payment/verify', {
        session_id,
        tournamentId,
        eventId,
    });
    return data;
};

/**
 * Check if the current user has already paid for an item
 * 
 * @param {string} itemId - MongoDB ID of the tournament or event
 * @returns {Object} { hasPaid, payment }
 */
export const checkPaymentStatus = async (itemId) => {
    const { data } = await api.get(`/payment/status/${itemId}`);
    return data;
};
