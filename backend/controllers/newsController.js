const Parser = require('rss-parser');

const parser = new Parser();

const feeds = [
    'https://www.espn.com/espn/rss/news',
    'https://www.thehansindia.com/sports/feed',
    'https://feeds.feedburner.com/ndtvsports-latest',
    'https://economictimes.indiatimes.com/rssfeeds/26407562.cms',
    'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms',
];

const fetchFeedArticles = async (feedUrl) => {
    try {
        const feed = await parser.parseURL(feedUrl);
        const feedTitle = feed.title || 'Sports News';

        return feed.items.slice(0, 4).map((item) => ({
            title: item.title || '',
            description: item.contentSnippet || item.content || '',
            url: item.link || '',
            urlToImage: item.enclosure?.url || null,
            publishedAt: item.isoDate || item.pubDate || null,
            source: { name: feedTitle },
        }));
    } catch (error) {
        console.error(`Failed to fetch feed ${feedUrl}:`, error.message);
        return [];
    }
};

const getSportsNews = async (req, res) => {
    try {
        const allFeeds = await Promise.all(feeds.map(fetchFeedArticles));

        let articles = allFeeds.flat();

        articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        articles = articles.slice(0, 20);

        res.json({ articles });
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ message: 'Failed to fetch news', error: error.message });
    }
};

module.exports = { getSportsNews };
