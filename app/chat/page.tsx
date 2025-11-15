"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getSymptomAdviceClient } from "@/lib/client-api"
import type { SymptomAdvice } from "@/lib/types"
import ReactMarkdown from "react-markdown"

function ChatContent() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI health assistant. I can help you understand your symptoms and provide guidance. What health concerns do you have today?"
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [quizContext, setQuizContext] = useState<Record<string, string> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Handle quiz context from URL parameters
  useEffect(() => {
    const quizParam = searchParams.get('quiz')
    if (quizParam) {
      try {
        const context = JSON.parse(decodeURIComponent(quizParam))
        setQuizContext(context)
        
        // Generate initial AI response based on quiz answers
        generateInitialResponse(context)
      } catch (error) {
        console.error('Error parsing quiz context:', error)
      }
    }
  }, [searchParams])

  const generateInitialResponse = async (context: Record<string, string>) => {
    setIsLoading(true)
    
    // Create a symptom description from quiz answers
    const symptomDescription = `I have ${context['symptom-type'] || 'health issues'}. The severity is ${context['severity'] || 'moderate'}, and I've had it for ${context['duration'] || 'a few days'}.`
    
    try {
      const advice = await getSymptomAdviceClient(symptomDescription)
      
      const initialResponse = {
        id: Date.now().toString(),
        type: 'assistant' as const,
        content: `Hi! I see you just completed our health quiz. Based on your answers about ${context['symptom-type'] || 'your symptoms'}, I have some personalized guidance for you.

## What I understand:
- **Symptom:** ${context['symptom-type'] || 'Not specified'}
- **Severity:** ${context['severity'] || 'Not specified'}
- **Duration:** ${context['duration'] || 'Not specified'}

## What you can do:
${advice.recommendations.map(rec => `- ${rec}`).join('\n')}

## When to see a doctor:
${advice.doctorReasons.map(reason => `- ${reason}`).join('\n')}

${advice.followUpQuestions && advice.followUpQuestions.length > 0 ? `## Questions to think about:\n${advice.followUpQuestions.map(q => `- ${q}`).join('\n')}\n\n` : ''}${advice.safetyNotes ? `## Important:\n${advice.safetyNotes}\n\n` : ''}## Remember:
**I'm here to help, but a real doctor can examine you in person and give you the best advice for your specific situation. If you're worried or not sure what to do, talk to a trusted adult who can help you see a doctor.**

Feel free to ask me any questions about your symptoms or these recommendations!`
      }
      
      setMessages(prev => [...prev, initialResponse])
    } catch (error) {
      console.error('Error generating initial response:', error)
      const fallbackResponse = {
        id: Date.now().toString(),
        type: 'assistant' as const,
        content: `Hi! I see you completed our health quiz about ${context['symptom-type'] || 'your symptoms'}. While I can provide general guidance, it's important to consult with a healthcare provider for personalized medical advice. What specific questions do you have about your symptoms?`
      }
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputValue
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsLoading(true)

    try {
      // Create context-aware symptom description
      let symptomDescription = currentInput
      if (quizContext) {
        const contextInfo = `Context from quiz: ${quizContext['symptom-type'] || 'health issues'}, severity: ${quizContext['severity'] || 'moderate'}, duration: ${quizContext['duration'] || 'a few days'}. `
        symptomDescription = contextInfo + currentInput
      }

      const advice = await getSymptomAdviceClient(symptomDescription)
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: `I understand your concern. ${advice.explanation}

## What you can do:
${advice.recommendations.map(rec => `- ${rec}`).join('\n')}

## When to see a doctor:
${advice.doctorReasons.map(reason => `- ${reason}`).join('\n')}

${advice.followUpQuestions && advice.followUpQuestions.length > 0 ? `## Questions to think about:\n${advice.followUpQuestions.map(q => `- ${q}`).join('\n')}\n\n` : ''}${advice.safetyNotes ? `## Important:\n${advice.safetyNotes}\n\n` : ''}## Remember:
**I'm here to help, but a real doctor can examine you in person and give you the best advice for your specific situation. If you're worried or not sure what to do, talk to a trusted adult who can help you see a doctor.**`
      }
      
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const fallbackResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: "I understand your concern. While I can provide general guidance, it's important to consult with a healthcare provider for personalized medical advice. Your symptoms may resolve with rest and time. Monitor for any changes and seek medical attention if symptoms worsen."
      }
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
      <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 
            className="text-3xl font-bold cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.location.href = '/'}
          >
            💬 HealthBuddy Chat 💬
          </h1>
          <a 
            href="/login"
            className="bg-white text-teal-600 px-6 py-2 rounded-full font-bold hover:bg-teal-50 transform hover:scale-105 transition-all shadow-lg"
          >
            🔐 Sign In
          </a>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 py-6 pb-40">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
            Chat with AI Health Assistant! 🤖
          </h1>
          {quizContext && (
            <div className="mt-4 p-5 bg-gradient-to-br from-cyan-100 to-teal-100 border-4 border-cyan-300 rounded-3xl shadow-lg">
              <h3 className="text-lg font-bold text-teal-800 mb-3">📋 Quiz Results</h3>
              <div className="text-base text-teal-700 space-y-2 font-semibold">
                <p><strong>🌟 Symptom:</strong> {quizContext['symptom-type'] || 'Not specified'}</p>
                <p><strong>⚡ Severity:</strong> {quizContext['severity'] || 'Not specified'}</p>
                <p><strong>⏰ Duration:</strong> {quizContext['duration'] || 'Not specified'}</p>
              </div>
            </div>
          )}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms... 😊"
              className="flex-1 border-4 border-cyan-300 rounded-full px-6 py-4 text-lg focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-200 shadow-lg"
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-full font-bold hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 transform hover:scale-105 transition-all shadow-lg text-lg flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  ✉️ Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 
            className="text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors"
            onClick={() => window.location.href = '/'}
          >
            HealthBuddy
          </h1>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-gray-600">Loading chat...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ChatContent />
    </Suspense>
  )
}