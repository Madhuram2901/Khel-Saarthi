const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../services/chatService');

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        const reply = await getChatResponse(message);
        res.json({ reply });
    } catch (error) {
        console.error("Route Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
