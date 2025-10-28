/**
 * Real-Time Data Collection Agent
 * Constantly parses Reddit, Google Trends, and X/Twitter for real-time experiential marketing trends
 */

export class RealtimeDataAgent {
  constructor() {
    this.backendUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : window.location.origin;
    
    this.collectionInterval = 60000; // Collect every minute
    
    this.trendsData = {
      reddit: [],
      twitter: [],
      googleTrends: [],
      aggregated: []
    };
    
    this.isRunning = false;
    this.collectionStats = {
      totalCollected: 0,
      lastUpdate: null,
      errors: 0
    };
  }

  /**
   * Start real-time data collection
   */
  async start() {
    if (this.isRunning) return;
    
    console.log('🚀 Starting Real-Time Data Collection Agent...');
    this.isRunning = true;
    
    // Initial collection
    await this.collectAllSources();
    
    // Set up interval for continuous collection
    this.intervalId = setInterval(() => {
      this.collectAllSources();
    }, this.collectionInterval);
    
    console.log('✓ Agent running - collecting every 60 seconds');
  }

  /**
   * Stop real-time data collection
   */
  stop() {
    if (!this.isRunning) return;
    
    console.log('⏹ Stopping Real-Time Data Collection Agent...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    console.log('✓ Agent stopped');
  }

  /**
   * Collect from all data sources in parallel
   */
  async collectAllSources() {
    try {
      console.log('📊 Collecting real-time data from all sources...');
      
      const [redditData, twitterData, googleTrendsData] = await Promise.allSettled([
        this.collectFromReddit(),
        this.collectFromTwitter(),
        this.collectFromGoogleTrends()
      ]);
      
      // Process results
      this.trendsData.reddit = redditData.status === 'fulfilled' ? redditData.value : [];
      this.trendsData.twitter = twitterData.status === 'fulfilled' ? twitterData.value : [];
      this.trendsData.googleTrends = googleTrendsData.status === 'fulfilled' ? googleTrendsData.value : [];
      
      // Aggregate all trends
      this.aggregateTrends();
      
      this.collectionStats.lastUpdate = new Date();
      this.collectionStats.totalCollected = this.trendsData.aggregated.length;
      
      console.log(`✓ Collected: ${this.trendsData.reddit.length} Reddit, ${this.trendsData.twitter.length} Twitter, ${this.trendsData.googleTrends.length} Google Trends`);
      console.log(`✓ Total aggregated trends: ${this.trendsData.aggregated.length}`);
      
      // Dispatch event for UI update
      this.dispatchTrendsUpdateEvent();
      
    } catch (error) {
      this.collectionStats.errors++;
      console.error('Error in real-time collection:', error);
    }
  }

  /**
   * Collect trends from Reddit
   */
  async collectFromReddit() {
    const subreddits = [
      'technology', 'marketing', 'Entrepreneur', 'startups',
      'ecommerce', 'socialmedia', 'branding', 'advertising',
      'productivity', 'Marketing'
    ];
    
    const allTrends = [];
    
    for (const subreddit of subreddits) {
      try {
        const response = await fetch(`${this.backendUrl}/api/reddit/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subreddit, limit: 10 })
        });
        
        if (response.ok) {
          const data = await response.json();
          const trends = data.posts.map(post => this.transformRedditPost(post, subreddit));
          allTrends.push(...trends);
        }
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Reddit collection error for r/${subreddit}:`, error.message);
      }
    }
    
    return allTrends;
  }

  /**
   * Collect trends from Twitter/X
   */
  async collectFromTwitter() {
    const keywords = [
      'experiential marketing', 'brand activation', 'customer experience',
      'event marketing', 'social media trends', 'digital marketing',
      'marketing technology', 'brand strategy', 'consumer trends'
    ];
    
    const allTrends = [];
    
    for (const keyword of keywords) {
      try {
        const response = await fetch(`${this.backendUrl}/api/twitter/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: keyword, limit: 5 })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (!data.mock && data.tweets) {
            const trends = data.tweets.map(tweet => this.transformTweet(tweet, keyword));
            allTrends.push(...trends);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Twitter collection error for "${keyword}":`, error.message);
      }
    }
    
    return allTrends;
  }

  /**
   * Collect trends from Google Trends
   */
  async collectFromGoogleTrends() {
    const keywords = [
      'experiential marketing', 'brand activation', 'customer experience',
      'event marketing', 'VR experiences', 'metaverse marketing'
    ];
    
    const allTrends = [];
    
    for (const keyword of keywords) {
      try {
        const response = await fetch(`${this.backendUrl}/api/trends`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: keyword })
        });
        
        if (response.ok) {
          const data = await response.json();
          const trend = this.transformGoogleTrend(data, keyword);
          if (trend) allTrends.push(trend);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Google Trends error for "${keyword}":`, error.message);
      }
    }
    
    return allTrends;
  }

  /**
   * Transform Reddit post to trend format
   */
  transformRedditPost(post, subreddit) {
    const engagement = (post.score || 0) + (post.numComments || 0) * 2;
    const now = Date.now();
    const postTime = post.created * 1000;
    const hoursSincePost = (now - postTime) / (1000 * 60 * 60);
    
    // Calculate if emerging (last 72 hours)
    const isEmerging = hoursSincePost <= 72;
    
    return {
      id: `reddit_${post.id}`,
      title: post.title,
      category: this.categorizeSubreddit(subreddit),
      velocityScore: Math.min(Math.floor(engagement / 10), 400),
      currentPhase: isEmerging ? 'early_adopters' : 'early_majority',
      confidence: Math.min((post.upvoteRatio || 0) * 100, 95),
      sources: [{
        platform: 'Reddit',
        url: post.permalink ? `https://reddit.com${post.permalink}` : `https://reddit.com/r/${subreddit}`,
        mentions: post.score,
        engagement: post.numComments
      }],
      shortDescription: post.selftext?.substring(0, 200) || `Trending on r/${subreddit}`,
      timestamp: postTime,
      engagement,
      score: post.score,
      platform: 'Reddit',
      isEmerging,
      subreddit
    };
  }

  /**
   * Transform tweet to trend format
   */
  transformTweet(tweet, keyword) {
    const metrics = tweet.public_metrics || {};
    const engagement = (metrics.retweet_count || 0) * 2 + (metrics.like_count || 0);
    const now = Date.now();
    const tweetTime = new Date(tweet.created).getTime();
    const hoursSinceTweet = (now - tweetTime) / (1000 * 60 * 60);
    
    const isEmerging = hoursSinceTweet <= 72;
    
    return {
      id: `twitter_${tweet.id}`,
      title: tweet.text?.substring(0, 100) || keyword,
      category: 'Marketing',
      velocityScore: Math.min(Math.floor(engagement / 50), 400),
      currentPhase: isEmerging ? 'early_adopters' : 'early_majority',
      confidence: 75,
      sources: [{
        platform: 'Twitter',
        url: `https://twitter.com/statuses/${tweet.id}`,
        mentions: metrics.retweet_count || 0,
        engagement: metrics.like_count || 0
      }],
      shortDescription: tweet.text?.substring(0, 200) || `Trending on Twitter about ${keyword}`,
      timestamp: tweetTime,
      engagement,
      score: metrics.retweet_count || 0,
      platform: 'Twitter',
      isEmerging
    };
  }

  /**
   * Transform Google Trends data to trend format
   */
  transformGoogleTrend(data, keyword) {
    if (data.mock || !data.interest_over_time) return null;
    
    const avgInterest = data.interest_over_time.reduce((sum, item) => sum + item.value, 0) / data.interest_over_time.length;
    
    if (avgInterest < 40) return null; // Only trending items
    
    return {
      id: `googletrends_${keyword.replace(/\s+/g, '_')}`,
      title: `${keyword} - Trending Search`,
      category: 'Marketing',
      velocityScore: Math.round(avgInterest * 4), // Scale 0-100 to 0-400
      currentPhase: 'early_adopters',
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
      platform: 'Google Trends',
      isEmerging: true
    };
  }

  /**
   * Categorize subreddit by Jack Morton verticals
   */
  categorizeSubreddit(subreddit) {
    const catMap = {
      'technology': 'Tech',
      'marketing': 'Marketing',
      'Entrepreneur': 'Business',
      'startups': 'Business',
      'ecommerce': 'Retail',
      'socialmedia': 'Marketing',
      'branding': 'Marketing',
      'advertising': 'Marketing',
      'productivity': 'Business'
    };
    return catMap[subreddit] || 'General';
  }

  /**
   * Aggregate all trends and sort by relevance
   */
  aggregateTrends() {
    const all = [
      ...this.trendsData.reddit,
      ...this.trendsData.twitter,
      ...this.trendsData.googleTrends
    ];
    
    // Deduplicate by title similarity
    const unique = [];
    const seen = new Set();
    
    all.forEach(trend => {
      const key = trend.title.toLowerCase().slice(0, 50);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(trend);
      }
    });
    
    // Sort by velocity and recency
    this.trendsData.aggregated = unique.sort((a, b) => {
      if (a.isEmerging !== b.isEmerging) return b.isEmerging - a.isEmerging; // Emerging first
      return (b.velocityScore || 0) - (a.velocityScore || 0);
    });
  }

  agreement/**
   * Dispatch event when trends are updated
   */
  dispatchTrendsUpdateEvent() {
    const event = new CustomEvent('realtimeTrendsUpdated', {
      detail: {
        trends: this.trendsData.aggregated,
        stats: this.collectionStats
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get all collected trends
   */
  getTrends() {
    return this.trendsData.aggregated;
  }

  /**
   * Get collection statistics
   */
  getStats() {
    return this.collectionStats;
  }
}

export const realtimeAgent = new RealtimeDataAgent();
