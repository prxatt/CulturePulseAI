/**
 * Data Collector Service
 * Integrates with Reddit, Google Trends, and Twitter APIs
 * Implements $0 budget strategy
 */

export class DataCollector {
  constructor() {
    this.redditEndpoint = 'https://www.reddit.com/r/{subreddit}/hot.json';
    this.googleTrendsEndpoint = '/api/trends';
    this.twitterEndpoint = '/api/twitter';
    this.isInitialized = false;
    
    // Dynamic backend URL - works locally and on Vercel
    this.backendUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : window.location.origin;
  }

  /**
   * Initialize data collector
   */
  async init() {
    if (this.isInitialized) return;
    
    try {
      // Test API connections
      await this.testRedditConnection();
      console.log('Data Collector initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing data collector:', error);
    }
  }

  /**
   * Test Reddit API connection
   */
  async testRedditConnection() {
    const testSubreddit = 'technology';
    const response = await this.fetchRedditData(testSubreddit, 5);
    
    if (response && response.length > 0) {
      console.log('✓ Reddit API connected successfully');
      return true;
    }
    throw new Error('Reddit API connection failed');
  }

  /**
   * Fetch Reddit posts (NO API KEY REQUIRED)
   * Reddit has a public JSON API
   * @param {string} subreddit - Subreddit name
   * @param {number} limit - Number of posts
   * @returns {Promise<Array>} Trending posts
   */
  async fetchRedditData(subreddit = 'technology', limit = 25) {
    try {
      const response = await fetch(`${this.backendUrl}/api/reddit/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subreddit, limit })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✓ Fetched ${data.posts.length} posts from r/${subreddit} via proxy`);
        return data.posts;
      } else {
        // Server error - return empty array
        console.warn(`Proxy returned ${response.status} for r/${subreddit}`);
        return [];
      }
    } catch (error) {
      console.log(`Reddit proxy error for r/${subreddit}:`, error.message);
      return [];
    }
  }

  /**
   * Parse Reddit JSON response
   * @param {Object} data - Reddit API response
   * @returns {Array} Parsed posts
   */
  parseRedditData(data) {
    if (!data || !data.data || !data.data.children) {
      return [];
    }

    return data.data.children.map(child => {
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
        trending: post.score > 1000 // Consider trending if score > 1000
      };
    });
  }

  /**
   * Fetch Google Trends data (REQUIRES PROXY)
   * Google Trends requires CORS proxy or backend
   * @param {string} query - Search query
   * @returns {Promise<Object>} Trends data
   */
  async fetchGoogleTrends(query) {
    try {
      const response = await fetch(`${this.backendUrl}/api/trends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✓ Fetched Google Trends data for "${query}"`);
        return data;
      } else {
        console.warn('Google Trends proxy not available, using fallback');
        throw new Error('Proxy unavailable');
      }
    } catch (error) {
      console.warn('Error fetching Google Trends:', error.message);
      // Return fallback data
      return {
        query,
        interest_over_time: [],
        related_queries: [query],
        regions: [],
        mock: true
      };
    }
  }

  /**
   * Fetch Twitter data (REQUIRES API KEY)
   * @param {string} query - Search query
   * @param {number} limit - Number of tweets
   * @returns {Promise<Array>} Tweets
   */
  async fetchTwitterData(query, limit = 10) {
    try {
      const response = await fetch(`${this.backendUrl}/api/twitter/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, limit })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✓ Fetched ${data.tweets?.length || 0} tweets for "${query}"`);
        return this.parseTwitterData(data);
      } else {
        throw new Error('Twitter proxy unavailable');
      }
    } catch (error) {
      console.warn('Error fetching Twitter data:', error.message);
      return [];
    }
  }

  /**
   * Parse Twitter API response
   * @param {Object} data - Twitter API response
   * @returns {Array} Parsed tweets
   */
  parseTwitterData(data) {
    if (!data.tweets || !Array.isArray(data.tweets)) {
      return [];
    }

    return data.tweets.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      created: tweet.created,
      metrics: tweet.public_metrics || {},
      author: tweet.author_id,
      mock: tweet.mock || false
    }));
  }

  /**
   * Collect trends from multiple sources
   * @param {Array<string>} queries - Search queries
   * @returns {Promise<Array>} Combined trends
   */
  async collectTrends(queries = []) {
    const results = [];

    for (const query of queries) {
      try {
        // Fetch from Reddit (working now)
        const redditData = await this.fetchRedditData(query);
        
        // Add to results
        results.push({
          query,
          source: 'Reddit',
          data: redditData,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error(`Error collecting trends for "${query}":`, error);
      }
    }

    return results;
  }

  /**
   * Monitor specific subreddits for trends
   * @param {Array<string>} subreddits - List of subreddits
   * @param {number} interval - Check interval in minutes
   * @returns {Promise<Array>} New trends
   */
  async monitorSubreddits(subreddits = ['technology', 'gadgets', 'futurology'], interval = 60) {
    const trends = [];

    for (const subreddit of subreddits) {
      try {
        const posts = await this.fetchRedditData(subreddit, 10);
        
        // Filter for trending posts
        const trending = posts.filter(post => post.trending);
        
        trends.push({
          subreddit,
          count: trending.length,
          posts: trending
        });
      } catch (error) {
        console.error(`Error monitoring r/${subreddit}:`, error);
      }
    }

    return trends;
  }

  /**
   * Collect and merge trends from Reddit, X/Twitter, and Google Trends
   * Focused on Jack Morton client verticals
   * @returns {Promise<Array>} Top 15 merged trends from all platforms
   */
  async collectBusinessTrends() {
    // Collect from all platforms in parallel
    const [redditTrends, twitterTrends, googleTrends] = await Promise.all([
      this.collectRedditTrends().catch(() => []),
      this.collectTwitterTrends().catch(() => []),
      this.collectGoogleTrendsData().catch(() => [])
    ]);

    console.log(`✓ Reddit: ${redditTrends.length} trends`);
    console.log(`✓ Twitter/X: ${twitterTrends.length} trends`);
    console.log(`✓ Google Trends: ${googleTrends.length} trends`);

    // Merge and deduplicate trends
    const mergedTrends = this.mergeTrends(redditTrends, twitterTrends, googleTrends);
    
    // Smart ranking by user score, interest, and relevance
    const rankedTrends = this.rankTrends(mergedTrends);
    
    console.log(`✓ Merged to ${rankedTrends.length} unique trends`);
    
    return rankedTrends.slice(0, 15);
  }

  /**
   * Collect trends from Reddit only
   * @returns {Promise<Array>} Reddit trends
   */
  async collectRedditTrends() {
    // Focused on cultural consumer trends relevant to experiential marketing
    const businessSubreddits = [
      // Consumer Culture & Brand Experiences
      'Marketing', 'advertising', 'branding',
      'shopping', 'deals', 'product', 
      'consumers', 'customerjourneys',
      
      // Lifestyle & Culture
      'Productivity', 'Frugal', 'Entrepreneur',
      'Showerthoughts', 'mildlyinteresting',
      
      // Events & Experiences
      'festivals', 'concerts', 'liveevents'
    ];

    console.log(`Monitoring ${businessSubreddits.length} subreddits...`);
    
    const allTrends = [];
    let successCount = 0;
    let errorCount = 0;

    // Fetch in smaller batches with longer delays to avoid rate limiting
    const batchSize = 5; // Reduced from 10 to avoid 429 errors
    const delayBetweenRequests = 500; // 500ms between requests
    
    for (let i = 0; i < businessSubreddits.length; i += batchSize) {
      const batch = businessSubreddits.slice(i, i + batchSize);
      
      // Process sequentially (not parallel) to avoid rate limits
      for (const subreddit of batch) {
        try {
          const posts = await this.fetchRedditData(subreddit, 15);
          
          const trends = posts.map(post => this.transformToTrend(post, subreddit));
          allTrends.push(...trends);
          successCount++;
          
          if (successCount % 5 === 0) {
            console.log(`✓ Processed ${successCount}/${businessSubreddits.length} subreddits...`);
          }
          
          // Delay between each subreddit
          await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
        } catch (error) {
          errorCount++;
          console.warn(`Failed r/${subreddit}: ${error.message}`);
          
          // Longer delay on error
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Longer delay between batches
      if (i + batchSize < businessSubreddits.length) {
        console.log(`⏸ Pausing 3 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log(`✓ Completed: ${successCount} successful, ${errorCount} errors, ${allTrends.length} total trends`);

    // Sort by engagement (score + comments)
    allTrends.sort((a, b) => (b.engagement || 0) - (a.engagement || 0));

    // Return all Reddit trends (will be merged with others)
    return allTrends;
  }

  /**
   * Collect trends from Twitter/X
   * @returns {Promise<Array>} Twitter trends
   */
  async collectTwitterTrends() {
    const keywords = ['technology', 'Tesla', 'Apple', 'BMW', 'fashion', 'food', 'coffee'];
    const trends = [];
    
    for (const keyword of keywords) {
      const tweets = await this.fetchTwitterData(keyword, 5);
      
      // Filter out mock tweets and low engagement
      const realTweets = tweets.filter(tweet => 
        !tweet.mock && 
        (tweet.metrics?.retweet_count > 50 || tweet.metrics?.like_count > 100)
      );
      
      trends.push(...realTweets.map(tweet => ({
        id: `twitter_${tweet.id}`,
        title: tweet.text?.substring(0, 100),
        category: this.categorizeKeyword(keyword),
        source: 'Twitter/X',
        platform: 'Twitter',
        velocityScore: this.calculateTwitterScore(tweet),
        confidence: 75,
        sources: [{
          platform: 'Twitter',
          url: `https://twitter.com/statuses/${tweet.id}`,
          mentions: tweet.metrics?.retweet_count || 0,
          engagement: tweet.metrics?.like_count || 0
        }],
        shortDescription: tweet.text?.substring(0, 200) || '',
        timestamp: new Date(tweet.created).getTime(),
        engagement: tweet.metrics?.like_count || 0,
        score: tweet.metrics?.retweet_count || 0,
        primaryAudience: { gender: 'All', ageRange: '18-55' },
        peakExpected: 'Unknown',
        tags: [keyword, 'Twitter'],
        subcategories: [],
        isRedditTrend: false
      })));
    }
    
    return trends;
  }

  /**
   * Collect data from Google Trends
   * @returns {Promise<Array>} Google Trends data
   */
  async collectGoogleTrendsData() {
    const keywords = ['Tesla', 'Apple', 'BMW', 'fashion trends', 'coffee trends'];
    const trends = [];
    
    for (const keyword of keywords) {
      const data = await this.fetchGoogleTrends(keyword);
      if (data && data.interest_over_time && !data.mock) { // Only real trends, not mock
        const avgInterest = data.interest_over_time.reduce((sum, item) => sum + item.value, 0) / data.interest_over_time.length;
        if (avgInterest > 40) { // Only include highly trending topics
          trends.push({
            id: `googletrends_${keyword.replace(/\s+/g, '_')}`,
            title: `${keyword} - Trending on Google`,
            category: this.categorizeKeyword(keyword),
            source: 'Google Trends',
            platform: 'Google Trends',
            velocityScore: avgInterest,
            confidence: 85,
            sources: [{
              platform: 'Google Trends',
              url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword)}`,
              mentions: Math.round(avgInterest),
              engagement: data.interest_over_time.length
            }],
            shortDescription: `Search interest ${avgInterest}% above baseline for ${keyword}`,
            timestamp: Date.now(),
            engagement: Math.round(avgInterest),
            score: Math.round(avgInterest),
            primaryAudience: { gender: 'All', ageRange: '18-55' },
            peakExpected: 'Unknown',
            tags: [keyword],
            subcategories: [],
            isRedditTrend: false
          });
        }
      }
    }
    
    return trends;
  }

  /**
   * Categorize keyword by Jack Morton verticals
   */
  categorizeKeyword(keyword) {
    const kw = keyword.toLowerCase();
    if (kw.includes('apple') || kw.includes('tech')) return 'Tech';
    if (kw.includes('tesla') || kw.includes('bmw') || kw.includes('car')) return 'Automotive';
    if (kw.includes('fashion')) return 'Fashion';
    if (kw.includes('food') || kw.includes('coffee')) return 'Food & Beverage';
    if (kw.includes('finance') || kw.includes('invest')) return 'Finance';
    return 'General';
  }

  /**
   * Calculate Twitter engagement score
   */
  calculateTwitterScore(tweet) {
    const retweets = tweet.metrics?.retweet_count || 0;
    const likes = tweet.metrics?.like_count || 0;
    const replies = tweet.metrics?.reply_count || 0;
    return Math.min(Math.floor((retweets * 2 + likes + replies) / 100), 400);
  }

  /**
   * Merge trends from multiple platforms and deduplicate
   */
  mergeTrends(redditTrends, twitterTrends, googleTrends) {
    const trendMap = new Map();
    
    // Add all trends to map, grouping by similarity
    [...redditTrends, ...twitterTrends, ...googleTrends].forEach(trend => {
      const key = trend.title?.toLowerCase() || trend.id;
      
      if (trendMap.has(key)) {
        // Merge duplicate - combine sources and increase score
        const existing = trendMap.get(key);
        existing.sources = [...(existing.sources || []), ...(trend.sources || [])];
        existing.velocityScore = Math.max(existing.velocityScore, trend.velocityScore || 0);
        existing.confidence = Math.max(existing.confidence, trend.confidence || 0);
        existing.engagement += trend.engagement || 0;
      } else {
        trendMap.set(key, { ...trend });
      }
    });
    
    return Array.from(trendMap.values());
  }

  /**
   * Smart ranking by user score, interest, and relevance
   */
  rankTrends(trends) {
    return trends.sort((a, b) => {
      // Multi-factor scoring
      const scoreA = this.calculateRelevanceScore(a);
      const scoreB = this.calculateRelevanceScore(b);
      return scoreB - scoreA;
    });
  }

  /**
   * Calculate relevance score based on multiple factors
   */
  calculateRelevanceScore(trend) {
    // Factors: engagement, velocity, confidence, source diversity
    const engagementScore = Math.log10(trend.engagement + 1) * 30;
    const velocityScore = trend.velocityScore || 0;
    const confidenceScore = trend.confidence || 0;
    const sourceDiversity = trend.sources?.length || 1;
    const diversityBonus = sourceDiversity * 20; // Bonus for appearing on multiple platforms
    
    return engagementScore + velocityScore + confidenceScore + diversityBonus;
  }

  /**
   * Transform Reddit post to CulturePulse trend format
   * @param {Object} post - Reddit post
   * @param {string} subreddit - Subreddit name
   * @returns {Object} Trend object
   */
  transformToTrend(post, subreddit) {
    // Comprehensive category mapping
    const categoryMap = {
      // Tech
      'technology': 'Tech', 'gadgets': 'Tech', 'futurology': 'Tech', 'artificial': 'Tech',
      'MachineLearning': 'Tech', 'singularity': 'Tech', 'webdev': 'Tech', 'programming': 'Tech',
      'software': 'Tech', 'sysadmin': 'Tech', 'appdev': 'Tech', 'cybersecurity': 'Tech',
      'Android': 'Tech', 'apple': 'Tech', 'Windows': 'Tech', 'Samsung': 'Tech',
      
      // Business
      'marketing': 'Business', 'startups': 'Business', 'entrepreneur': 'Business',
      'smallbusiness': 'Business', 'digital_marketing': 'Business', 'Seo': 'Business',
      'advertising': 'Business', 'branding': 'Business', 'growthhacking': 'Business',
      
      // Fashion
      'fashion': 'Fashion', 'malefashionadvice': 'Fashion', 'streetwear': 'Fashion',
      'sneakers': 'Fashion', 'apparel': 'Fashion', 'watches': 'Fashion',
      
      // Food
      'food': 'Food', 'cooking': 'Food', 'coffee': 'Food', 'tea': 'Food',
      'cocktails': 'Food', 'craftbeer': 'Food', 'wine': 'Food',
      
      // Automotive Brands (Tesla, BMW, Mercedes, Ford)
      'automotive': 'Automotive', 'cars': 'Automotive', 'Tesla': 'Automotive',
      'BMW': 'Automotive', 'mercedes_benz': 'Automotive', 'TeslaLounge': 'Automotive', 'ford': 'Automotive',
      
      // Financial Services
      'Banking': 'Finance', 'investing': 'Finance', 'CryptoCurrency': 'Finance',
      'FinancialPlanning': 'Finance', 'stocks': 'Finance',
      
      // Health & Wellness
      'fitness': 'Wellness', 'yoga': 'Wellness', 'nutrition': 'Wellness',
      
      // Travel & Tourism
      'travel': 'Travel', 'solotravel': 'Travel', 'digitalnomad': 'Travel',
      
      // Arts & Design
      'photography': 'Arts', 'design': 'Design', 'graphic_design': 'Design',
      'web_design': 'Design', 'UI_Design': 'Design', 'architecture': 'Design',
      'Typography': 'Design', 'LogoDesign': 'Design', 'UXDesign': 'Design',
      
      // Entertainment
      'movies': 'Entertainment', 'music': 'Entertainment', 'gaming': 'Entertainment',
      
      // Default
      'default': 'General'
    };

    // Calculate velocity score based on engagement
    const engagement = (post.score || 0) + (post.numComments || 0) * 2;
    const velocityScore = Math.min(Math.floor(engagement / 10), 400);

    // Determine phase based on score
    let phase = 'unknown';
    if (post.score > 5000) phase = 'early_majority';
    else if (post.score > 1000) phase = 'early_adopters';
    else phase = 'innovators';

    return {
      id: `reddit_${post.id}`,
      title: post.title,
      category: categoryMap[subreddit] || 'General',
      subreddit,
      velocityScore,
      currentPhase: phase,
      confidence: Math.min(post.upvoteRatio * 100, 95),
      sources: [{
        platform: 'Reddit',
        url: post.permalink ? `https://reddit.com${post.permalink}` : `https://reddit.com/r/${subreddit}`,
        mentions: post.score,
        engagement: post.numComments
      }],
      shortDescription: post.selftext?.substring(0, 200) || `Trending on r/${subreddit}`,
      timestamp: post.created * 1000,
      engagement,
      score: post.score,
      primaryAudience: {
        gender: 'All',
        ageRange: '18-55'
      },
      peakExpected: 'Unknown',
      tags: [subreddit, categoryMap[subreddit] || 'General'],
      subcategories: [],
      isRedditTrend: true
    };
  }
}

// Export singleton instance
export const dataCollector = new DataCollector();

