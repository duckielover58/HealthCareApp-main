# 🏥 Healthcare Symptom Checker App

A modern, privacy-focused healthcare application that helps users assess symptoms through AI-powered chat and guided quizzes. Features image analysis for visual symptom assessment.

## ✨ Features

### 🤖 AI-Powered Analysis
- **Chat Interface**: Direct conversation with AI health assistant
- **Image Analysis**: Take photos or upload images for visual symptom assessment
- **Guided Quiz**: Step-by-step symptom assessment
- **RAG Integration**: Grounded medical knowledge for accurate advice

### 📱 User Experience
- **Mobile-First Design**: Responsive interface for all devices
- **Privacy-First**: All data stays on your device
- **User Accounts**: Login/logout with session management
- **History Tracking**: Save and review past assessments
- **Settings Management**: Privacy controls and account options

### 🔒 Privacy & Security
- **HIPAA Compliant Design**: Privacy-first approach
- **Local Storage**: Data stored in browser session
- **No Server Storage**: Images and data processed locally
- **Encryption**: Secure data handling

## 🚀 Live Demo

**Deployed on GitHub Pages**: [Your App URL Here]

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **AI**: Google Gemini (gemini-1.5-flash)
- **UI**: Radix UI + Tailwind CSS
- **Icons**: Lucide React
- **Hosting**: GitHub Pages (Free)

## 📸 Image Analysis Features

### Camera Integration
- 📱 **Live Camera**: Take photos directly in the app
- 📁 **File Upload**: Upload existing images
- 🔒 **Privacy Notice**: Clear information about data usage
- 🎯 **AI Analysis**: Visual symptom detection

### Supported Image Types
- Rashes and skin conditions
- Cuts and injuries
- Swelling and inflammation
- General health concerns

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Deploy to GitHub Pages

1. **Create GitHub Repository**
   - Go to GitHub and create a new public repository
   - Name it something like `healthcare-app`

2. **Push Your Code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Select "GitHub Actions" as source
   - Wait 5-10 minutes for deployment

4. **Your app will be live at**
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```

## 📋 Usage Guide

### Chat with AI
1. Click "Chat with AI" on the home page
2. Type your symptoms or use the camera/upload buttons
3. Send your message and get AI-powered advice
4. Review recommendations and doctor consultation reasons

### Guided Quiz
1. Click "Guided Quiz" on the home page
2. Answer questions about your symptoms
3. Get personalized recommendations
4. Save results to your history

### Image Analysis
1. In the chat interface, click "Camera" or "Upload"
2. Take a photo or select an image
3. Add optional text description
4. Get AI analysis of visual symptoms

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── chat/              # Chat interface with AI
│   ├── quiz/              # Guided symptom quiz
│   ├── history/           # User assessment history
│   ├── settings/          # User settings and privacy
│   └── api/               # API routes (development only)
├── components/            # Reusable UI components
│   ├── ui/               # Radix UI components
│   └── camera-privacy-notice.tsx
├── lib/                   # Utility functions and services
│   ├── client-api.ts     # Client-side API service
│   ├── symptom-service.ts # Symptom analysis service
│   └── types.ts          # TypeScript type definitions
└── public/               # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues) page
2. Review the deployment logs in GitHub Actions
3. Ensure all environment variables are set correctly

## 🎉 Acknowledgments

- Built with Next.js and Tailwind CSS
- AI powered by Google Gemini
- UI components from Radix UI
- Icons from Lucide React