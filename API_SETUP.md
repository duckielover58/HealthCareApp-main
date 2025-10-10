# API Setup Instructions

## OpenAI API Key Setup

To enable AI-powered health advice, you need to set up an OpenAI API key:

### 1. Get an OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click "Create new secret key"
4. Copy the API key (it starts with `sk-`)

### 2. Add the API Key to Your Environment
Create a `.env.local` file in the project root and add:

```
OPENAI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied.

### 3. Restart the Development Server
After adding the API key, restart your development server:

```bash
npm run dev
```

### 4. Verify It's Working
- Complete a quiz or send a message in the chat
- Check the browser console for "Successfully got AI response:" logs
- The AI should now provide personalized responses instead of fallback responses

## Without API Key
If you don't set up the API key, the app will still work but will use rule-based fallback responses instead of AI-generated ones.

## Cost Information
- OpenAI API usage is pay-per-use
- Typical cost for health advice responses: $0.001-0.01 per response
- You can set usage limits in your OpenAI account
