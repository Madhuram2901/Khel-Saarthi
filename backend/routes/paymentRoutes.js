const express = require('express');
const router = express.Router();
const { createSession, verifyPayment, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// ============================================================
// Payment Routes
// ============================================================
// All routes below require authentication (JWT token)

// POST /api/payment/create-session  → Create a Stripe session
router.post('/create-session', protect, createSession);

// POST /api/payment/verify        → Verify payment after completion
router.post('/verify', protect, verifyPayment);

// GET  /api/payment/status/:itemId → Check if user already paid
router.get('/status/:itemId', protect, getPaymentStatus);

module.exports = router;
