# Healthcare App Setup Guide

## LLM Integration Setup

This app now includes LLM integration using OpenAI's GPT-3.5-turbo model for intelligent symptom analysis.

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set up OpenAI API Key

1. Get an OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a `.env.local` file in the root directory
3. Add your API key:

```
OPENAI_API_KEY=your_actual_api_key_here
```

### 3. Run the Application

```bash
npm run dev
# or
pnpm dev
```

The app will be available at `http://localhost:3000`

## Features

- **LLM-Powered Symptom Analysis**: Uses GPT-3.5-turbo to provide intelligent, personalized health advice
- **Fallback System**: If the LLM API is unavailable, falls back to keyword-based analysis
- **Child-Friendly Interface**: Designed specifically for pediatric healthcare guidance
- **Emergency Detection**: Automatically identifies emergency situations
- **Guided Input**: Step-by-step symptom input for easier use

## How it Works

1. User describes symptoms (free text or guided questions)
2. App sends description to OpenAI API with specialized pediatric healthcare prompt
3. LLM analyzes symptoms and returns structured advice
4. App displays recommendations, severity level, and when to see a doctor
5. If API fails, falls back to built-in keyword analysis

## Safety Features

- Always errs on the side of caution for children's health
- Identifies emergency situations requiring immediate medical attention
- Provides clear guidance on when to seek professional help
- Uses child-friendly language throughout 