import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

    if (!TWITTER_BEARER_TOKEN) {
      return res.json({
        tweets: generateMockTwitterData(query, limit),
        mock: true
      });
    }

    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${limit}&tweet.fields=public_metrics,created_at,author_id&expansions=author_id`,
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    const tweets = (data.data || []).map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      created: tweet.created_at,
      public_metrics: tweet.public_metrics,
      author_id: tweet.author_id
    }));

    res.json({ tweets });
  } catch (error) {
    console.error('Twitter proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}

function generateMockTwitterData(query, limit) {
  const tweets = [];
  for (let i = 0; i < limit; i++) {
    tweets.push({
      id: `mock_${Date.now()}_${i}`,
      text: `Mock tweet about ${query}: This is a sample tweet with trending content.`,
      created: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      public_metrics: {
        retweet_count: Math.floor(Math.random() * 1000),
        like_count: Math.floor(Math.random() * 5000),
        reply_count: Math.floor(Math.random() * 200)
      },
      mock: true
    });
  }
  return tweets;
}
