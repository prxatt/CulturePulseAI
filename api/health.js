// Health check endpoint for Vercel
export default function handler(req, res) {
  const tokenExists = !!process.env.TWITTER_BEARER_TOKEN;
  const tokenLength = tokenExists ? String(process.env.TWITTER_BEARER_TOKEN).length : 0;
  
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    twitterConfigured: tokenExists,
    tokenLength: tokenLength, // Will help debug if variable is set
    message: tokenExists ? 'Twitter API ready' : 'Add TWITTER_BEARER_TOKEN to Vercel environment variables'
  });
}

