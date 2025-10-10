# AI API Setup Guide

## 🚀 Free AI APIs You Can Use

The app now supports multiple AI APIs. Here are the free options you can set up:

### 1. 🤗 Hugging Face Inference API (RECOMMENDED - FREE)

**Why it's great:**
- Completely free for inference
- No credit card required
- Good for text generation
- Easy to set up

**How to get your token:**
1. Go to [huggingface.co](https://huggingface.co)
2. Sign up for a free account
3. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new token (select "Read" permissions)
5. Copy the token

**Setup:**
1. Create a `.env.local` file in your project root
2. Add: `HUGGINGFACE_TOKEN=your_token_here`
3. Restart your development server

### 2. 🔑 OpenAI API (PAID BUT GENEROUS FREE TIER)

**Why it's great:**
- Best quality responses
- $5 free credit (lasts a long time for this app)
- Very reliable
- Great for health advice

**How to get your key:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up for an account
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Create a new secret key
5. Copy the key

**Setup:**
1. Add to your `.env.local` file: `OPENAI_API_KEY=your_key_here`
2. Restart your development server

### 3. 🆓 Other Free Options

**Google Gemini (Free tier available):**
- Go to [ai.google.dev](https://ai.google.dev)
- Get API key
- Add: `GEMINI_API_KEY=your_key_here`

**Anthropic Claude (Free tier available):**
- Go to [console.anthropic.com](https://console.anthropic.com)
- Get API key
- Add: `CLAUDE_API_KEY=your_key_here`

## 📝 Environment Variables Setup

Create a `.env.local` file in your project root:

```env
# Choose one or more of these:
HUGGINGFACE_TOKEN=your_huggingface_token_here
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
CLAUDE_API_KEY=your_claude_key_here
```

## 🔄 How It Works

The API will try each service in this order:
1. **Hugging Face** (if token provided)
2. **OpenAI** (if key provided)
3. **Enhanced fallback** (always works)

## 💡 Recommendations

**For Development:**
- Start with Hugging Face (completely free)
- Add OpenAI if you want better quality

**For Production:**
- Use OpenAI for best quality
- Keep Hugging Face as backup
- The enhanced fallback ensures it always works

## 🧪 Testing

After adding your API keys:
1. Restart your development server: `npm run dev`
2. Complete a quiz or send a chat message
3. Check the server logs to see which API is being used
4. You should see "Hugging Face response received" or "OpenAI response received" in the logs

## 🆘 Troubleshooting

**If you see "Using enhanced fallback response":**
- Check that your API key is correct
- Make sure the `.env.local` file is in the project root
- Restart the development server after adding keys
- Check the server logs for error messages

**If you get rate limit errors:**
- The app has built-in rate limiting (100 requests/minute)
- Wait a minute and try again
- Consider upgrading to a paid plan for higher limits

## 💰 Cost Estimates

**Hugging Face:** FREE (unlimited for this use case)
**OpenAI:** ~$0.001 per request (very cheap)
**Google Gemini:** FREE tier available
**Anthropic Claude:** FREE tier available

For a typical user session (5-10 requests), you'd spend less than $0.01 with OpenAI.
