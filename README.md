# HealthBuddy - Your Friendly Health Helper

A safe, simple health advice app designed specifically for children and teens aged 8-15. HealthBuddy provides easy-to-understand guidance for minor health concerns while always encouraging consultation with parents, guardians, or healthcare providers.

## 🎯 Mission

To provide children and teens with fast, clear, and safe healthcare guidance using a retrieval-augmented LLM (RAG) grounded in trusted medical sources. The app will always encourage a real doctor visit as a final recommendation.

## ✨ Features

### Core Features
- **Simple Symptom Input**: Describe symptoms in your own words or use guided questions
- **Safe Health Advice**: Get easy-to-understand recommendations for minor health issues
- **Emergency Recognition**: Automatically identifies serious symptoms and directs to emergency care
- **Privacy-First**: No personal data collection, session-based storage only
- **Feedback System**: Rate advice helpfulness and get follow-up options

### Safety Features
- **Always Encourages Doctor Consultation**: Every response includes when to see a healthcare provider
- **Clear Disclaimers**: Prominent reminders that this is not a diagnosis
- **Emergency Alerts**: Immediate recognition of serious symptoms
- **Parent/Guardian Guidance**: Always suggests involving trusted adults

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd v0HealthCareApp-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 📱 How to Use

### 1. Describe Your Symptoms
- **Free Text**: Write about your symptoms in your own words
- **Guided Questions**: Answer simple questions about what's wrong, where it hurts, and how bad it is

### 2. Get Advice
- **What to Do**: Step-by-step instructions for treating minor issues
- **Why It Helps**: Simple explanations of why the treatment works
- **When to See a Doctor**: Clear guidance on when professional help is needed

### 3. Follow Up
- **Rate Helpfulness**: Let us know if the advice was useful
- **Try Again**: Get different advice if needed
- **Emergency Guidance**: Immediate direction if symptoms are serious

## 🛡️ Safety & Ethics

### Medical Disclaimer
HealthBuddy provides general health information only and is not a substitute for professional medical advice. Always consult with a parent, guardian, or healthcare provider for proper diagnosis and treatment.

### Data Privacy
- No personal health data is stored permanently
- Session-based storage only
- No user accounts or profiles
- No data sharing with third parties

### Emergency Situations
The app recognizes serious symptoms and will:
- Immediately direct users to tell an adult
- Provide emergency contact information
- Never delay seeking professional medical help

## 🏗️ Technical Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component library
- **Lucide React**: Icon library

### Backend (Mock Implementation)
- **Symptom Service**: Keyword-based advice system
- **Future RAG Integration**: OpenAI + vector database planned
- **Session Storage**: Temporary data storage

### Key Components
- `app/symptom/page.tsx`: Main symptom input interface
- `app/results/page.tsx`: Advice display with feedback
- `app/history/page.tsx`: Past symptom tracking
- `components/disclaimer.tsx`: Safety disclaimers
- `lib/symptom-service.ts`: Advice generation logic

## 🎨 Design Principles

### User Experience
- **Simple & Clear**: Easy-to-understand language for children
- **Non-Clinical**: Friendly, approachable design
- **Accessible**: WCAG compliant components
- **Mobile-First**: Optimized for mobile devices

### Visual Design
- **Friendly Colors**: Blue gradient background, warm accents
- **Clear Typography**: Readable fonts with good contrast
- **Helpful Icons**: Intuitive iconography
- **Responsive Layout**: Works on all screen sizes

## 🔮 Future Enhancements

### Planned Features
- **Voice Input**: Speech-to-text for younger users
- **User Accounts**: Secure login with parent consent
- **Symptom Tracking**: Progress monitoring over time
- **RAG Integration**: Real AI-powered advice system
- **Multi-language Support**: Spanish and other languages

### Technical Improvements
- **Real Backend**: Node.js/Express API
- **Database**: PostgreSQL for user data
- **Authentication**: Secure user management
- **Analytics**: Usage insights (anonymized)

## 🤝 Contributing

We welcome contributions that improve safety, accessibility, and user experience. Please ensure all changes:

1. Maintain safety standards
2. Include appropriate disclaimers
3. Test with target age group
4. Follow accessibility guidelines

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Important Notice

**HealthBuddy is not a medical device and does not provide medical diagnosis or treatment. Always consult with qualified healthcare professionals for medical advice.**

---

Built with ❤️ for the health and safety of children and teens everywhere.