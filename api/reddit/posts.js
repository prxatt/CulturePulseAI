import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subreddit, limit = 25 } = req.body;

    if (!subreddit) {
      return res.status(400).json({ error: 'Subreddit required' });
    }

    console.log(`Fetching Reddit posts from r/${subreddit}, limit: ${limit}`);

    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}&raw_json=1`,
      {
        headers: {
          'User-Agent': 'CulturePulse AI/1.0 (https://jmdemos.vercel.app)'
        }
      }
    );

    if (!response.ok) {
      console.error(`Reddit API error ${response.status} for r/${subreddit}`);
      return res.status(response.status).json({ 
        error: `Reddit API error: ${response.status}`,
        subreddit 
      });
    }

    const data = await response.json();
    
    if (!data.data || !data.data.children) {
      return res.json({ posts: [], subreddit });
    }
    
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

    console.log(`✓ Fetched ${posts.length} posts from r/${subreddit}`);
    res.json({ posts, subreddit });
  } catch (error) {
    console.error('Reddit proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}