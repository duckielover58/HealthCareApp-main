# Environment Setup Guide

## 🔐 Secure API Key Configuration

### 1. Create Environment File

Create a `.env.local` file in the root directory of your project with the following content:

```bash
# Google Gemini API Key - Keep this secure and never commit to version control
# Get your API key from: https://ai.google.dev
GEMINI_API_KEY=your_gemini_api_key_here

# Environment Configuration
NODE_ENV=development
```

### 2. Security Best Practices

✅ **DO:**
- Keep the `.env.local` file in your `.gitignore`
- Use environment variables for all API keys
- Rotate API keys regularly
- Use different keys for development and production

❌ **DON'T:**
- Commit API keys to version control
- Share API keys in public repositories
- Hardcode keys in your source code
- Use the same key across multiple projects

### 3. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 4. Restart Development Server

```bash
npm run dev
# or
pnpm dev
```

## 🔒 Security Features Implemented

- **Environment Variable Protection**: API keys stored in `.env.local` (not committed to git)
- **Secure API Calls**: All requests use HTTPS
- **Session Management**: Secure cookie handling
- **Data Encryption**: All sensitive data is encrypted
- **HIPAA Compliance**: Privacy-first design

## 🚀 Ready to Use

Once you've created the `.env.local` file with your Gemini API key, the app will automatically use Google's Gemini model for intelligent symptom analysis!

The app will work with:
- **Gemini 1.5 Flash**: Fast, efficient responses
- **RAG Integration**: Medical knowledge base
- **Emergency Detection**: Automatic emergency identification
- **Fallback System**: Works even if API is unavailable 