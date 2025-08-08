# GitHub Pages Deployment Guide

## 🚀 Deploy Your Healthcare App to GitHub Pages

This guide will help you deploy your healthcare app to GitHub Pages for free hosting.

### 📋 Prerequisites

1. **GitHub Account**: You need a GitHub account
2. **Git Installed**: Make sure Git is installed on your computer
3. **Repository**: Your code should be in a GitHub repository

### 🔧 Setup Steps

#### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `healthcare-app` or `healthbuddy`
3. Make it public (required for free GitHub Pages)

#### 2. Push Your Code

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Healthcare app with image analysis"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

#### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. This will use the workflow we created in `.github/workflows/deploy.yml`

#### 4. Configure GitHub Pages

1. In the **Pages** settings, make sure:
   - Source: **GitHub Actions**
   - Branch: **main** (or your default branch)

### 🔄 Automatic Deployment

The GitHub Actions workflow will automatically:
- Build your Next.js app
- Export it as static files
- Deploy to GitHub Pages
- Update on every push to main branch

### 🌐 Your Live Website

Once deployed, your app will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

### 📱 Features Available

✅ **Static Hosting**: Works without server-side APIs  
✅ **Image Analysis**: Client-side fallback for image processing  
✅ **Responsive Design**: Works on all devices  
✅ **Privacy-First**: All data stays on your device  
✅ **Free Hosting**: No costs involved  

### 🔧 Custom Domain (Optional)

To use a custom domain:
1. Go to repository **Settings** → **Pages**
2. Add your custom domain in the **Custom domain** field
3. Configure DNS settings with your domain provider

### 🛠️ Troubleshooting

#### Build Issues
- Check the **Actions** tab in your repository
- Review build logs for errors
- Ensure all dependencies are in `package.json`

#### Page Not Loading
- Wait 5-10 minutes after pushing changes
- Check if the deployment completed successfully
- Verify the URL is correct

#### API Issues
- The app uses client-side fallbacks for static hosting
- No server-side APIs are needed
- All functionality works offline

### 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Review the deployment workflow
3. Ensure your repository is public
4. Verify GitHub Pages is enabled

### 🎉 Success!

Your healthcare app is now live on the internet for free! 🚀

**Features Available:**
- 📸 Image capture and analysis
- 💬 Chat interface with AI
- 📝 Guided symptom quiz
- 👤 User accounts and history
- 🔒 Privacy and security features
- 📱 Mobile-responsive design 