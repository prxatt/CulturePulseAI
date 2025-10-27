// Health check endpoint for Vercel
export default function handler(req, res) {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    twitterConfigured: !!process.env.TWITTER_BEARER_TOKEN 
  });
}

