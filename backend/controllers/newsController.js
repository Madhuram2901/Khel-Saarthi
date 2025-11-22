const axios = require('axios');

const getSportsNews = async (req, res) => {
    try {
        // You can get an API key from https://newsapi.org/
        const apiKey = process.env.NEWS_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: 'News API key is missing in backend .env' });
        }

        // Switch to 'everything' endpoint to search for specific Indian sports
        // This avoids the empty results from the 'in' category and gives more relevant content
        const response = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: 'cricket OR badminton OR "indian football" OR "team india" OR kabaddi',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 20, // Limit to 20 relevant articles
                apiKey: apiKey
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        if (error.response) {
            console.error('News API Error Response:', error.response.data);
            console.error('News API Status:', error.response.status);
        }
        res.status(500).json({ message: 'Failed to fetch news', error: error.message });
    }
};

module.exports = { getSportsNews };
