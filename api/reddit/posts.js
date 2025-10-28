import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subreddit, limit = 25 } = req.body;

    if (!subreddit) {
      return res.status(400).json({ error: 'Subreddit required' });
    }

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
}

