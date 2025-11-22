const axios = require('axios');

const getSportsNews = async (req, res) => {
    try {
        // You can get an API key from https://newsapi.org/
        const apiKey = process.env.NEWS_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: 'News API key is missing in backend .env' });
        }

        const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
            params: {
                category: 'sports',
                country: 'us', // Default to India, can be changed
                apiKey: apiKey
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ message: 'Failed to fetch news' });
    }
};

module.exports = { getSportsNews };
