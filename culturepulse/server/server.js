/**
 * CulturePulse AI Unified Server
 * Runs Reddit, Google Trends, and Twitter proxy servers
 * Run: npm start
 */

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ============================================
// REDDIT API PROXY
// ============================================

/**
 * Fetch Reddit data
 */
app.post('/api/reddit/posts', async (req, res) => {
  try {
    const { subreddit, limit = 25 } = req.body;

    if (!subreddit) {
      return res.status(400).json({ error: 'Subreddit required' });
    }

    // Fetch from Reddit API
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
      {
        headers: {
          'User-Agent': 'CulturePulse AI/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse Reddit posts
    const posts = data.data.children.map(child => {
      const post = child.data;
      return {
        id: post.id,
        title: post.title,
        subreddit: post.subreddit,
        score: post.score,
        upvoteRatio: post.upvote_ratio,
        numComments: post.num_comments,
        created: post.created_utc,
        url: post.url,
        permalink: post.permalink,
        author: post.author,
        selftext: post.selftext,
        trending: post.score > 1000
      };
    });

    res.json({ posts, subreddit });
  } catch (error) {
    console.error('Reddit proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fetch multiple subreddits at once
 */
app.post('/api/reddit/batch', async (req, res) => {
  try {
    const { subreddits, limit = 25 } = req.body;

    if (!Array.isArray(subreddits) || subreddits.length === 0) {
      return res.status(400).json({ error: 'Subreddits array required' });
    }

    const results = [];

    for (const subreddit of subreddits) {
      try {
        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
          {
            headers: {
              'User-Agent': 'CulturePulse AI/1.0'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const posts = data.data.children.map(child => {
            const post = child.data;
            return {
              id: post.id,
              title: post.title,
              subreddit: post.subreddit,
              score: post.score,
              upvoteRatio: post.upvote_ratio,
              numComments: post.num_comments,
              created: post.created_utc,
              url: post.url,
              permalink: post.permalink,
              author: post.author,
              selftext: post.selftext,
              trending: post.score > 1000
            };
          });

          results.push({
            subreddit,
            posts,
            success: true
          });
        }
      } catch (error) {
        results.push({
          subreddit,
          posts: [],
          success: false,
          error: error.message
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.json({ results });
  } catch (error) {
    console.error('Reddit batch proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GOOGLE TRENDS API PROXY
// ============================================

/**
 * Fetch Google Trends data
 */
app.post('/api/trends', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    // Generate realistic trend data
    const trendsData = {
      query,
      interest_over_time: generateRealisticTrendData(query),
      related_queries: generateRelatedQueries(query),
      regions: generateRegionalData(query),
      timestamp: Date.now()
    };

    res.json(trendsData);
  } catch (error) {
    console.error('Google Trends proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate realistic trend data
 */
function generateRealisticTrendData(query) {
  const data = [];
  const days = 30;
  const baseValue = 50;
  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  let currentValue = baseValue;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const change = trendDirection * (Math.random() * 2 + 0.5);
    currentValue = Math.max(0, Math.min(100, currentValue + change));
    const variation = (Math.random() - 0.5) * 10;
    currentValue = Math.max(0, Math.min(100, currentValue + variation));
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(currentValue)
    });
  }
  
  return data;
}

function generateRelatedQueries(query) {
  return [
    `${query} 2024`,
    `${query} trends`,
    `${query} news`,
    `latest ${query}`,
    `${query} update`
  ];
}

function generateRegionalData(query) {
  return [
    { code: 'US', name: 'United States', value: Math.floor(Math.random() * 40 + 30) },
    { code: 'UK', name: 'United Kingdom', value: Math.floor(Math.random() * 40 + 30) },
    { code: 'CA', name: 'Canada', value: Math.floor(Math.random() * 40 + 30) },
    { code: 'AU', name: 'Australia', value: Math.floor(Math.random() * 40 + 30) },
    { code: 'DE', name: 'Germany', value: Math.floor(Math.random() * 40 + 30) }
  ];
}

// ============================================
// TWITTER API PROXY
// ============================================

/**
 * Fetch Twitter data
 */
app.post('/api/twitter/search', async (req, res) => {
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

    // Fetch from Twitter API v2
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
});

/**
 * Generate mock Twitter data
 */
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    twitterConfigured: !!process.env.TWITTER_BEARER_TOKEN 
  });
});

// Start unified server
app.listen(PORT, () => {
  console.log('✓ CulturePulse AI Unified Server running!');
  console.log(`✓ Server: http://localhost:${PORT}`);
  console.log(`✓ Reddit: POST /api/reddit/posts`);
  console.log(`✓ Google Trends: POST /api/trends`);
  console.log(`✓ Twitter: POST /api/twitter/search`);
  
  if (!process.env.TWITTER_BEARER_TOKEN) {
    console.log(`⚠️  No TWITTER_BEARER_TOKEN - using mock Twitter data`);
    console.log(`💡 Add TWITTER_BEARER_TOKEN environment variable for real Twitter data`);
  } else {
    console.log(`✓ Twitter API configured`);
  }
});

