#!/bin/bash

echo "🚀 Healthcare App Deployment Script"
echo "=================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy healthcare app to GitHub Pages"

# Check if remote exists
if ! git remote get-url origin &> /dev/null; then
    echo "🔗 Please add your GitHub repository as remote:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click Settings → Pages"
echo "3. Select 'GitHub Actions' as source"
echo "4. Wait 5-10 minutes for deployment"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 