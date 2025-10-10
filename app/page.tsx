"use client"

import { useState } from "react"
import { getSymptomAdviceClient } from "@/lib/client-api"
import type { SymptomAdvice } from "@/lib/types"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'home' | 'quiz' | 'chat' | 'results'>('home')
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
  const [advice, setAdvice] = useState<SymptomAdvice | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  const handleQuizAnswer = async (answer: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer }
    setAnswers(newAnswers)
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz complete - show results with AI advice
      setCurrentView('results')
      setIsLoading(true)
      
      try {
        // Create symptom description from quiz answers
        const symptomDescription = `I have ${newAnswers['symptom-type'] || 'health issues'}. The severity is ${newAnswers['severity'] || 'moderate'}, and I've had it for ${newAnswers['duration'] || 'a few days'}.`
        
        const adviceData = await getSymptomAdviceClient(symptomDescription)
        setAdvice(adviceData)
      } catch (error) {
        console.error('Error getting advice:', error)
        // Set fallback advice
        setAdvice({
          severity: "moderate",
          recommendations: [
            "Rest and take it easy",
            "Stay hydrated with water",
            "Tell an adult if you feel worse",
            "See a doctor if symptoms don't improve"
          ],
          explanation: "Your symptoms may resolve with rest and time. It's important to tell an adult how you're feeling.",
          doctorReasons: [
            "Symptoms don't improve after 2-3 days",
            "Symptoms get worse",
            "You develop a high fever",
            "You feel really bad"
          ],
          followUpQuestions: [
            "How are you feeling now?",
            "Have you told an adult about your symptoms?",
            "Do you have any other concerns?"
          ],
          safetyNotes: "When in doubt, tell an adult and ask them to help you see a doctor."
        })
      } finally {
        setIsLoading(false)
      }
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

  // Results View
  if (currentView === 'results') {
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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🎉 Quiz Complete!</h2>
              <p className="text-lg text-gray-600">Based on your answers, here's what we recommend:</p>
            </div>

            {/* Quiz Results Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">📋 Your Quiz Results</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong className="text-blue-700">Symptom:</strong>
                  <p className="text-blue-600">{answers['symptom-type'] || 'Not specified'}</p>
                </div>
                <div>
                  <strong className="text-blue-700">Severity:</strong>
                  <p className="text-blue-600">{answers['severity'] || 'Not specified'}</p>
                </div>
                <div>
                  <strong className="text-blue-700">Duration:</strong>
                  <p className="text-blue-600">{answers['duration'] || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg text-gray-600">Getting your personalized recommendations...</span>
                </div>
              </div>
            ) : advice ? (
              <div className="space-y-6">
                {/* Recommendations */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">💡 What You Can Do</h3>
                  <div className="space-y-2">
                    {advice.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold">•</span>
                        <p className="text-green-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">📝 What This Means</h3>
                  <p className="text-gray-700 leading-relaxed">{advice.explanation}</p>
                </div>

                {/* When to See a Doctor */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-yellow-800 mb-4">🏥 When to See a Doctor</h3>
                  <div className="space-y-2">
                    {advice.doctorReasons.map((reason, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold">•</span>
                        <p className="text-yellow-700">{reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Notes */}
                {advice.safetyNotes && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-red-800 mb-4">⚠️ Important</h3>
                    <p className="text-red-700 leading-relaxed">{advice.safetyNotes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <button 
                    onClick={() => {
                      // Set messages with quiz context
                      const contextMessage = {
                        id: Date.now().toString(),
                        type: 'assistant' as const,
                        content: `Hi! I see you just completed our health quiz. Based on your answers about ${answers['symptom-type'] || 'your symptoms'}, I have some personalized guidance for you.\n\n**What I understand:**\n• Symptom: ${answers['symptom-type'] || 'Not specified'}\n• Severity: ${answers['severity'] || 'Not specified'}\n• Duration: ${answers['duration'] || 'Not specified'}\n\n**My recommendations:**\n${advice.recommendations.map(rec => `• ${rec}`).join('\n')}\n\n**Why you should consider seeing a doctor:**\n${advice.doctorReasons.map(reason => `• ${reason}`).join('\n')}\n\n${advice.safetyNotes ? `**Important:** ${advice.safetyNotes}` : ''}\n\nFeel free to ask me any questions about your symptoms or these recommendations!`
                      }
                      setMessages([{
                        id: '1',
                        type: 'assistant',
                        content: "Hello! I'm your AI health assistant. I can help you understand your symptoms and provide guidance. What health concerns do you have today?"
                      }, contextMessage])
                      setCurrentView('chat')
                    }}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    🤖 Chat with AI Assistant
                    <span className="text-sm opacity-90">(Get more help)</span>
                  </button>
                  <button 
                    onClick={resetToHome}
                    className="bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    🏠 Back to Home
                  </button>
                </div>
              </div>
            ) : null}
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
            <h1 
              className="text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors"
              onClick={() => setCurrentView('home')}
            >
              HealthBuddy
            </h1>
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
