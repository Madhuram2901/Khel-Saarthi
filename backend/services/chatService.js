const { GoogleGenerativeAI } = require("@google/generative-ai");
const Event = require("../models/eventModel");
const Venue = require("../models/venueModel");

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
        // We fetch upcoming events and top venues to give the AI context
        const [events, venues] = await Promise.all([
            Event.find({ date: { $gte: new Date() } })
                .sort({ date: 1 })
                .limit(10)
                .select('title description date location category skillLevel entryFee'),
            Venue.find({})
                .sort({ rating: -1 }) // Show top rated venues
                .limit(10)
                .select('name description city sportTypes pricePerHour rating')
        ]);

        // Format data for the AI
        const eventStrings = events.map(e =>
            `- Event: ${e.title} (ID: ${e._id}) | Sport: ${e.category} | Level: ${e.skillLevel} | Date: ${new Date(e.date).toDateString()} | Fee: ₹${e.entryFee}`
        );

        const venueStrings = venues.map(v =>
            `- Venue: ${v.name} (ID: ${v._id}) | City: ${v.city} | Sports: ${v.sportTypes.join(', ')} | Rate: ₹${v.pricePerHour}/hr | Rating: ${v.rating}⭐`
        );

        const contextData = [...eventStrings, ...venueStrings].join('\n');

        // 2. Construct System Prompt
        const prompt = `
            You are 'Khel-Saarthi AI', an energetic, motivating, and helpful sports companion for the Khel-Saarthi app.
            
            CONTEXT - LIVE APP DATA:
            ${contextData}

            YOUR ROLE:
            - Help users find events and venues based on their interests.
            - Explain event/venue details.
            - Motivate them to play sports.
            - Be friendly and use sports-related emojis (🏏, ⚽, 🏸, 🏃).

            IMPORTANT - LINKING RULES:
            - When you mention a specific event from the context, YOU MUST format it as: [[EVENT:EventID:EventTitle]]
            - When you mention a specific venue from the context, YOU MUST format it as: [[VENUE:VenueID:VenueName]]
            - Example: "You should check out [[EVENT:65a1b2c3:Cricket Match]] at [[VENUE:65x9y8z7:Green Park Stadium]]."
            - Do NOT use markdown links [Title](url). Use the double bracket syntax above.

            RULES:
            1. ONLY use the provided context to answer questions about specific events or venues.
            2. If the user asks for something not in the list, politely say you don't see any upcoming events or venues for that right now.
            3. Keep answers concise (max 2-3 sentences unless detailed info is asked).
            4. If asked to book, tell them to click the link you provided.
            5. Do not make up fake events or venues.

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
