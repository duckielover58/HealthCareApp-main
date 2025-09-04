"use client"

import { useState } from "react"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'home' | 'quiz' | 'chat'>('home')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI health assistant. I can help you understand your symptoms and provide guidance. What health concerns do you have today?"
    }
  ])
  const [inputValue, setInputValue] = useState("")

  const questions = [
    {
      id: "symptom-type",
      question: "What type of health issue are you experiencing?",
      options: ["Fever", "Cough/Cold", "Stomach Issues", "Pain", "Skin Problems", "Injury", "Other"]
    },
    {
      id: "severity",
      question: "How bad is it?",
      options: ["Mild - annoying but manageable", "Moderate - uncomfortable", "Severe - very painful", "Emergency - can't function"]
    },
    {
      id: "duration",
      question: "How long have you had this problem?",
      options: ["Less than 24 hours", "1-2 days", "3-5 days", "More than 5 days"]
    }
  ]

  const handleQuizAnswer = (answer: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer }
    setAnswers(newAnswers)
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz complete - show results
      alert("Quiz complete! Your answers: " + JSON.stringify(newAnswers, null, 2))
      setCurrentView('home')
      setCurrentQuestion(0)
      setAnswers({})
    }
  }

  const handleChatSend = () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I understand your concern. While I can provide general guidance, it's important to consult with a healthcare provider for personalized medical advice. Your symptoms may resolve with rest and time. Monitor for any changes and seek medical attention if symptoms worsen."
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const resetToHome = () => {
    setCurrentView('home')
    setCurrentQuestion(0)
    setAnswers({})
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: "Hello! I'm your AI health assistant. I can help you understand your symptoms and provide guidance. What health concerns do you have today?"
      }
    ])
    setInputValue("")
  }

  // Quiz View
  if (currentView === 'quiz') {
    const question = questions[currentQuestion]
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">HealthBuddy</h1>
            <button 
              onClick={resetToHome}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
            >
              Back to Home
            </button>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Assessment Quiz</h1>
              <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
            </div>

            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">{question.question}</h2>
              
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(option)}
                    className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Chat View
  if (currentView === 'chat') {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">HealthBuddy</h1>
            <button 
              onClick={resetToHome}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
            >
              Back to Home
            </button>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 py-6 pb-40">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Chat with AI Health Assistant</h1>
          </div>

          <div className="space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {message.type === 'user' ? 'U' : 'A'}
                    </div>
                    
                    <div className={`${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className="bg-gray-100 p-4 rounded-lg mb-2">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="max-w-4xl mx-auto flex gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Describe your symptoms..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleChatSend}
                disabled={!inputValue.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Home View
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">HealthBuddy</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personal Health Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant health guidance, track your symptoms, and make informed decisions about your well-being.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setCurrentView('quiz')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              Start Health Quiz
            </button>
            <button 
              onClick={() => setCurrentView('chat')}
              className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50"
            >
              Chat with AI
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="text-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">AI-Powered Chat</h3>
            <p className="text-gray-600">Get personalized health advice through natural conversation.</p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Guided Health Quiz</h3>
            <p className="text-gray-600">Answer simple questions to get targeted recommendations.</p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600">Your health data stays private and secure.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
