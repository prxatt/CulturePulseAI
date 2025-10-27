# CulturePulse AI - Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Deployment to Vercel via GitHub](#deployment-to-vercel-via-github)
3. [Future Updates Workflow](#future-updates-workflow)
4. [Troubleshooting](#troubleshooting)

---

## 🖥️ Local Development Setup

### For Non-Technical Users

#### Step 1: Start the Backend Server

1. Open Terminal (Mac: `Cmd + Space`, type "Terminal", press Enter)
2. Navigate to the server folder:
   ```bash
   cd /Users/prattlove/Desktop/jack-morton-demos/culturepulse/server
   ```
3. Install dependencies (one-time only):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

You should see:
```
✓ CulturePulse AI Unified Server running!
✓ Server: http://localhost:3000
```

**Important:** Keep this terminal window open and running.

#### Step 2: Open the Dashboard

1. Open your web browser
2. Open the file: `/Users/prattlove/Desktop/jack-morton-demos/culturepulse/index.html`
3. The dashboard will load with live trend data

### To Stop the Server
Press `Ctrl + C` in the terminal window

---

## 🚀 Deployment to Vercel via GitHub

### Initial Setup (One-Time)

#### 1. Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Repository name: `culturepulse-ai`
4. Select "Private" (recommended) or "Public"
5. Click "Create repository"

#### 2. Push Code to GitHub

In your terminal (from the main project directory):

```bash
cd /Users/prattlove/Desktop/jack-morton-demos/culturepulse
git init
git add .
git commit -m "Initial commit: CulturePulse AI Dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/culturepulse-ai.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

#### 3. Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `culturepulse-ai` repository
4. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** `./culturepulse`
   - **Build Command:** (leave empty)
   - **Output Directory:** `./culturepulse`
5. Click "Deploy"

#### 4. Setup Server on Vercel

Since your app needs a backend server, you'll need to deploy the server separately:

**Option A: Deploy Server to Railway/Render (Recommended)**

1. Go to [Railway.app](https://railway.app) or [Render.com](https://render.com)
2. Connect your GitHub account
3. Select your repository
4. Set Root Directory: `server`
5. Add environment variable: `TWITTER_BEARER_TOKEN` (optional)
6. Deploy

**Option B: Use Vercel Serverless Functions**

Create `api/proxy.js` in your culturepulse folder:

```javascript
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Forward requests to your backend server
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${backendUrl}${req.url}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

Update `js/services/data-collector.js` to use the Vercel API routes instead of localhost.

---

## 🔄 Future Updates Workflow

### Making Frontend Changes

1. **Edit files locally** (using VS Code or your preferred editor)
2. **Test locally** by:
   - Starting the server: `cd culturepulse/server && npm start`
   - Opening `index.html` in your browser
   - Making sure everything works

3. **Push to GitHub**:
   ```bash
   cd /Users/prattlove/Desktop/jack-morton-demos/culturepulse
   git add .
   git commit -m "Description of your changes"
   git push
   ```

4. **Vercel automatically deploys** - Your changes will be live in 1-2 minutes!

### Frontend Update Checklist

- [ ] Edit HTML/CSS/JavaScript files
- [ ] Test locally
- [ ] Commit changes to git
- [ ] Push to GitHub
- [ ] Wait for Vercel deployment (check Vercel dashboard)
- [ ] Verify changes on live site

### Common Changes You'll Make

#### Update Trend Data
Edit: `js/data/trends-sample.js`

#### Update Styling
Edit: `css/main.css` or any file in `css/components/`

#### Update Dashboard Layout
Edit: `index.html`

#### Add New Features
Edit: `js/main.js` or create new files in `js/`

---

## 🐛 Troubleshooting

### Problem: "Cannot find module"
**Solution:** Run `cd culturepulse/server && npm install`

### Problem: "Port 3000 already in use"
**Solution:** Stop other programs using port 3000, or change the port in `server/server.js`

### Problem: Dashboard shows "Loading trends..."
**Solution:** Make sure the backend server is running (`npm start` in the server folder)

### Problem: Changes not showing on Vercel
**Solution:** 
- Check Vercel deployment logs in the dashboard
- Make sure you pushed to GitHub: `git push`
- Wait 1-2 minutes for deployment to complete

### Problem: Need to add API keys
**Solution:**
1. Go to Vercel project settings
2. Add environment variables
3. Redeploy the project

---

## 📝 Project Structure

```
culturepulse/
├── index.html              # Main dashboard page
├── css/                    # All styling files
├── js/                     # All JavaScript code
│   ├── main.js            # Main app logic
│   ├── components/        # Reusable components
│   ├── data/              # Sample trend data
│   ├── services/          # API integration
│   └── utils/             # Helper functions
└── server/                # Backend API server
    └── server.js          # Main server file
```

---

## 🎯 Quick Reference Commands

### Start Development
```bash
cd culturepulse/server
npm start
```

### Update and Deploy
```bash
cd culturepulse
git add .
git commit -m "Your update description"
git push
```

### Check Git Status
```bash
git status
```

---

## 📞 Need Help?

If you encounter any issues:
1. Check the terminal/console for error messages
2. Check browser console (Right-click → Inspect → Console tab)
3. Review this guide's Troubleshooting section
4. Check Vercel deployment logs

---

**Last Updated:** October 2024


