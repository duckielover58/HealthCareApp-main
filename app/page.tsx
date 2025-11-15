"use client"

import { useState } from "react"
import { getSymptomAdviceClient } from "@/lib/client-api"
import type { SymptomAdvice } from "@/lib/types"
import ReactMarkdown from "react-markdown"

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
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
        <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold">🌟 HealthBuddy Quiz 🌟</h1>
            <div className="flex items-center gap-3">
              <a 
                href="/login"
                className="bg-white text-teal-600 px-4 py-2 rounded-full font-semibold hover:bg-teal-50 transform hover:scale-105 transition-all shadow-md text-sm"
              >
                🔐 Sign In
              </a>
              <button 
                onClick={resetToHome}
                className="bg-white text-teal-600 px-6 py-3 rounded-full font-bold hover:bg-teal-50 transform hover:scale-105 transition-all shadow-lg"
              >
                🏠 Back to Home
              </button>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent mb-3">
                Health Assessment Quiz 🎯
              </h1>
              <div className="inline-block bg-gradient-to-r from-cyan-300 to-teal-300 px-6 py-2 rounded-full">
                <p className="text-lg font-bold text-teal-800">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-cyan-50 border-4 border-cyan-300 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">{question.question}</h2>
              
              <div className="space-y-4">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(option)}
                    className="w-full text-left p-5 bg-gradient-to-r from-teal-100 to-cyan-100 border-4 border-teal-300 rounded-2xl hover:from-teal-200 hover:to-cyan-200 hover:border-teal-400 hover:scale-105 transition-all shadow-md font-semibold text-gray-800"
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
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
        <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold">💬 HealthBuddy Chat 💬</h1>
            <div className="flex items-center gap-3">
              <a 
                href="/login"
                className="bg-white text-teal-600 px-4 py-2 rounded-full font-semibold hover:bg-teal-50 transform hover:scale-105 transition-all shadow-md text-sm"
              >
                🔐 Sign In
              </a>
              <button 
                onClick={resetToHome}
                className="bg-white text-teal-600 px-6 py-3 rounded-full font-bold hover:bg-teal-50 transform hover:scale-105 transition-all shadow-lg"
              >
                🏠 Back to Home
              </button>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 py-6 pb-40">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
              Chat with AI Health Assistant! 🤖
            </h1>
          </div>

          <div className="space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold shadow-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' 
                        : 'bg-gradient-to-br from-cyan-400 to-teal-400 text-white'
                    }`}>
                      {message.type === 'user' ? '👤' : '🤖'}
                    </div>
                    
                    <div className={`${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`p-5 rounded-3xl mb-2 shadow-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-teal-200 to-cyan-200 border-2 border-teal-300'
                        : 'bg-gradient-to-br from-cyan-100 to-teal-100 border-2 border-cyan-300'
                    }`}>
                      {message.type === 'assistant' ? (
                        <div className="text-sm">
                          <ReactMarkdown
                            components={{
                              h2: ({children}) => <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">{children}</h2>,
                              strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                              ul: ({children}) => <ul className="list-disc list-inside space-y-1 my-2 ml-4">{children}</ul>,
                              li: ({children}) => <li className="text-gray-700">{children}</li>,
                              p: ({children}) => <p className="text-gray-700 mb-2">{children}</p>
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-cyan-100 to-teal-100 border-t-4 border-cyan-300 p-4 shadow-2xl">
            <div className="max-w-4xl mx-auto flex gap-3">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Describe your symptoms... 😊"
                className="flex-1 border-4 border-cyan-300 rounded-full px-6 py-4 text-lg focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-200 shadow-lg"
              />
              <button 
                onClick={handleChatSend}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-full font-bold hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 transform hover:scale-105 transition-all shadow-lg text-lg"
              >
                ✉️ Send
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
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
        <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold">🎉 HealthBuddy Results 🎉</h1>
            <div className="flex items-center gap-3">
              <a 
                href="/login"
                className="bg-white text-teal-600 px-4 py-2 rounded-full font-semibold hover:bg-teal-50 transform hover:scale-105 transition-all shadow-md text-sm"
              >
                🔐 Sign In
              </a>
              <button 
                onClick={resetToHome}
                className="bg-white text-teal-600 px-6 py-3 rounded-full font-bold hover:bg-teal-50 transform hover:scale-105 transition-all shadow-lg"
              >
                🏠 Back to Home
              </button>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent mb-4">
                🎉 Quiz Complete! 🎉
              </h2>
              <p className="text-xl text-gray-700 font-semibold">Based on your answers, here's what we recommend:</p>
            </div>

            {/* Quiz Results Summary */}
            <div className="bg-gradient-to-br from-cyan-100 to-teal-100 border-4 border-cyan-300 rounded-3xl p-6 mb-8 shadow-lg">
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
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 border-4 border-emerald-300 rounded-3xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-teal-800 mb-4">💡 What You Can Do</h3>
                  <div className="space-y-3">
                    {advice.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white rounded-2xl p-4 border-2 border-emerald-200">
                        <span className="text-2xl">✨</span>
                        <p className="text-teal-800 font-semibold text-lg">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-gradient-to-br from-cyan-100 to-teal-100 border-4 border-cyan-300 rounded-3xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-cyan-800 mb-4">📝 What This Means</h3>
                  <p className="text-cyan-800 leading-relaxed text-lg font-medium bg-white rounded-2xl p-4 border-2 border-cyan-200">{advice.explanation}</p>
                </div>

                {/* When to See a Doctor */}
                <div className="bg-gradient-to-br from-teal-100 to-cyan-100 border-4 border-teal-300 rounded-3xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-teal-800 mb-4">🏥 When to See a Doctor</h3>
                  <div className="space-y-3">
                    {advice.doctorReasons.map((reason, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white rounded-2xl p-4 border-2 border-teal-200">
                        <span className="text-2xl">🏥</span>
                        <p className="text-teal-800 font-semibold text-lg">{reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Notes */}
                {advice.safetyNotes && (
                  <div className="bg-gradient-to-br from-red-100 to-orange-100 border-4 border-red-300 rounded-3xl p-6 shadow-lg">
                    <h3 className="text-2xl font-bold text-red-800 mb-4">⚠️ Important</h3>
                    <p className="text-red-800 leading-relaxed text-lg font-semibold bg-white rounded-2xl p-4 border-2 border-red-200">{advice.safetyNotes}</p>
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
                        content: `Hi! I see you just completed our health quiz. Based on your answers about ${answers['symptom-type'] || 'your symptoms'}, I have some personalized guidance for you.

## What I understand:
- **Symptom:** ${answers['symptom-type'] || 'Not specified'}
- **Severity:** ${answers['severity'] || 'Not specified'}
- **Duration:** ${answers['duration'] || 'Not specified'}

## My recommendations:
${advice.recommendations.map(rec => `- ${rec}`).join('\n')}

## Why you should consider seeing a doctor:
${advice.doctorReasons.map(reason => `- ${reason}`).join('\n')}

${advice.safetyNotes ? `## Important:\n${advice.safetyNotes}` : ''}

Feel free to ask me any questions about your symptoms or these recommendations!`
                      }
                      setMessages([{
                        id: '1',
                        type: 'assistant',
                        content: "Hello! I'm your AI health assistant. I can help you understand your symptoms and provide guidance. What health concerns do you have today?"
                      }, contextMessage])
                      setCurrentView('chat')
                    }}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-10 py-5 rounded-full text-xl font-bold hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    🤖 Chat with AI Assistant
                    <span className="text-base opacity-90">(Get more help)</span>
                  </button>
                  <button 
                    onClick={resetToHome}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all shadow-xl"
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
        <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 
              className="text-3xl font-bold cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setCurrentView('home')}
            >
              🌟 HealthBuddy 🌟
            </h1>
            <div className="flex items-center gap-3">
              <a 
                href="/login"
                className="bg-white text-teal-600 px-6 py-2 rounded-full font-bold hover:bg-teal-50 transform hover:scale-105 transition-all shadow-lg"
              >
                🔐 Sign In
              </a>
            </div>
          </div>
        </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent mb-6">
            Your Personal Health Assistant! 🎉
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
            Get instant health guidance, track your symptoms, and make informed decisions about your well-being! 😊
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => setCurrentView('quiz')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              🎯 Start Health Quiz
            </button>
            <button 
              onClick={() => setCurrentView('chat')}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:from-cyan-600 hover:to-teal-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              💬 Chat with AI
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="text-center p-8 bg-gradient-to-br from-cyan-100 to-teal-100 border-4 border-cyan-300 rounded-3xl shadow-lg hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-teal-800 mb-3">AI-Powered Chat</h3>
            <p className="text-teal-700 font-medium">Get personalized health advice through natural conversation!</p>
          </div>
          
          <div className="text-center p-8 bg-gradient-to-br from-teal-100 to-cyan-100 border-4 border-teal-300 rounded-3xl shadow-lg hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-cyan-800 mb-3">Guided Health Quiz</h3>
            <p className="text-cyan-700 font-medium">Answer simple questions to get targeted recommendations!</p>
          </div>
          
          <div className="text-center p-8 bg-gradient-to-br from-emerald-100 to-teal-100 border-4 border-emerald-300 rounded-3xl shadow-lg hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-emerald-800 mb-3">Privacy First</h3>
            <p className="text-emerald-700 font-medium">Your health data stays private and secure!</p>
          </div>
        </div>
      </main>
    </div>
  )
}
