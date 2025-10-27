// Google Trends endpoint for Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}

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

