const { GoogleGenerativeAI } = require("@google/generative-ai");
const Event = require("../models/eventModel");

// Access API key from environment variables for security
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set in .env file. AI Chat features will fail.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Using gemini-2.5-flash as requested (fast, free tier available)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function getChatResponse(userMessage) {
    try {
        // 1. Fetch Context Data (Read-Only)
        // We fetch upcoming events to give the AI context about what's happening
        const events = await Event.find({ date: { $gte: new Date() } })
            .sort({ date: 1 })
            .limit(15)
            .select('title description date location category skillLevel entryFee');
        
        // Format data for the AI
        const eventContext = events.map(e => 
            `- Event: ${e.title} | Sport: ${e.category} | Level: ${e.skillLevel} | Date: ${new Date(e.date).toDateString()} | Fee: ₹${e.entryFee} | Desc: ${e.description}`
        ).join('\n');

        // 2. Construct System Prompt
        const prompt = `
            You are 'Khel-Saarthi AI', an energetic, motivating, and helpful sports companion for the Khel-Saarthi app.
            
            CONTEXT - LIVE APP DATA (UPCOMING EVENTS):
            ${eventContext}

            YOUR ROLE:
            - Help users find events based on their interests (e.g., "Find me a cricket match").
            - Explain event details.
            - Motivate them to play sports.
            - Be friendly and use sports-related emojis (🏏, ⚽, 🏸, 🏃).

            RULES:
            1. ONLY use the provided context to answer questions about specific events.
            2. If the user asks for something not in the list, politely say you don't see any upcoming events for that right now.
            3. Keep answers concise (max 2-3 sentences unless detailed info is asked).
            4. If asked to book, tell them to click the event card in the app.
            5. Do not make up fake events.

            User Question: ${userMessage}
        `;

        // 3. Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return text;

    } catch (error) {
        console.error("AI Service Error:", error);
        return "I'm having a bit of a cramp! (Service Error - Please check server logs)";
    }
}

module.exports = { getChatResponse };
