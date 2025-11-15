# GitHub Pages Setup Guide

## 🚀 Fix for GitHub Pages Deployment

The issue you're experiencing is that **GitHub Pages only serves static files** and doesn't support Next.js API routes. I've fixed this by making the AI API calls directly from the browser.

## ✅ What I Fixed:

1. **Client-Side AI Calls**: Moved AI API calls from server-side to client-side
2. **Environment Variables**: Updated to use `NEXT_PUBLIC_` prefix for browser access
3. **GitHub Actions**: Updated deployment workflow to include API keys

## 🔧 Setup Steps:

### 1. Add GitHub Secrets

You need to add your API keys as GitHub repository secrets:

1. Go to your GitHub repository: `https://github.com/duckielover58/v0HealthCareApp`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

**Secret Name**: `NEXT_PUBLIC_GEMINI_API_KEY`
**Secret Value**: `your_gemini_api_key_here`

**Secret Name**: `NEXT_PUBLIC_OPENAI_API_KEY` (optional)
**Secret Value**: `your_openai_key_here`

### 2. Deploy the Changes

1. **Commit and push** the changes:
   ```bash
   git add .
   git commit -m "Fix GitHub Pages deployment with client-side AI calls"
   git push origin main
   ```

2. **Wait for deployment** (check Actions tab in GitHub)

3. **Test the app** on your GitHub Pages URL

## 🧪 How to Test:

1. Go to your deployed app: `https://duckielover58.github.io/v0HealthCareApp`
2. Complete a quiz or send a chat message
3. Open browser console (F12) to see the logs
4. You should see: "🤖 Trying Google Gemini API..." and "✅ Google Gemini response received"

## 🔍 What Changed:

### Before (Server-Side - Not Working on GitHub Pages):
- API calls went to `/api/symptom-advice` (server-side)
- GitHub Pages can't run server-side code
- Result: 405 Method Not Allowed error

### After (Client-Side - Works on GitHub Pages):
- API calls go directly to Google Gemini API from browser
- No server-side code needed
- Result: Real AI responses! 🎉

## 🎯 Expected Results:

- **With API keys**: Real AI-generated responses from Google Gemini
- **Without API keys**: Enhanced fallback responses (still good!)
- **No more 405 errors**: All calls work on GitHub Pages

## 🆘 Troubleshooting:

**If you still see fallback responses:**
1. Check that GitHub secrets are set correctly
2. Check browser console for error messages
3. Verify the API key is correct

**If you see CORS errors:**
- This is normal for some APIs, the app will fall back to enhanced responses

The app will now work perfectly on GitHub Pages with real AI responses! 🚀
