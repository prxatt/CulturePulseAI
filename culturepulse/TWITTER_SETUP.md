# Twitter API Setup for Vercel

## Get Twitter Bearer Token

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or select existing app
3. Go to **Keys and Tokens** tab
4. Copy your **Bearer Token**

## Add to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Add:
   - **Name:** `TWITTER_BEARER_TOKEN`
   - **Value:** Your Bearer Token (starts with `AAAA...`)
   - **Environment:** Production (and Preview if you want)
5. Click **Save**

## Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **Redeploy**
4. Your app will now use real Twitter data!

## Test

Visit `/api/health` endpoint to check if Twitter is configured:
- `http://localhost:3000/api/health` (local)
- `https://your-app.vercel.app/api/health` (Vercel)

Look for `twitterConfigured: true` in the response.

