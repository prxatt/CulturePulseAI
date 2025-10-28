# CulturePulse AI - Real-Time Data Collection

## Overview
Real-time data collection agent that pulls experiential marketing trends from Reddit, Twitter/X, and Google Trends every 6 hours.

## Features

### Data Sources
1. **Reddit**: Marketing, technology, entrepreneurship subreddits
2. **Twitter/X**: Uses your API key from Vercel environment variables
3. **Google Trends**: Trending search queries for experiential marketing

### Update Schedule
- **Collection Interval**: Every 6 hours
- **Active Trends**: Updated every 6 hours (last 7 days)
- **Emerging Trends**: Updated every 6 hours (last 72 hours)

### Behavior
- Agent runs continuously once started
- Prevents duplicate instances on page refresh
- Merges new trends into existing dashboard
- Distinguishes active vs emerging trends automatically

## Console Logs
- `🚀 Starting Real-Time Data Collection Agent...` - Agent started
- `📊 Collecting real-time data from all sources...` - Collecting data
- `✓ Collected: X Reddit, Y Twitter, Z Google Trends` - Collection complete
- `Real-time trends updated` - New trends merged

## Testing
Check browser console for real-time collection activity. Data should appear within first 60 seconds on page load.
