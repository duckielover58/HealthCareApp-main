"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getSymptomAdviceClient } from "@/lib/client-api"
import type { SymptomAdvice } from "@/lib/types"

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
        content: `Hi! I see you just completed our health quiz. Based on your answers about ${context['symptom-type'] || 'your symptoms'}, I have some personalized guidance for you.\n\n**What I understand:**\n• Symptom: ${context['symptom-type'] || 'Not specified'}\n• Severity: ${context['severity'] || 'Not specified'}\n• Duration: ${context['duration'] || 'Not specified'}\n\n**My recommendations:**\n${advice.recommendations.map(rec => `• ${rec}`).join('\n')}\n\n**Why you should consider seeing a doctor:**\n${advice.doctorReasons.map(reason => `• ${reason}`).join('\n')}\n\n${advice.safetyNotes ? `**Important:** ${advice.safetyNotes}` : ''}\n\nFeel free to ask me any questions about your symptoms or these recommendations!`
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
        content: `I understand your concern. ${advice.explanation}\n\n**Recommendations:**\n${advice.recommendations.map(rec => `• ${rec}`).join('\n')}\n\n**When to see a doctor:**\n${advice.doctorReasons.map(reason => `• ${reason}`).join('\n')}\n\n${advice.safetyNotes ? `**Important:** ${advice.safetyNotes}` : ''}\n\n${advice.followUpQuestions && advice.followUpQuestions.length > 0 ? `**Questions to consider:**\n${advice.followUpQuestions.map(q => `• ${q}`).join('\n')}` : ''}`
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
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">HealthBuddy</h1>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 py-6 pb-40">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chat with AI Health Assistant</h1>
          {quizContext && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 Quiz Results</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Symptom:</strong> {quizContext['symptom-type'] || 'Not specified'}</p>
                <p><strong>Severity:</strong> {quizContext['severity'] || 'Not specified'}</p>
                <p><strong>Duration:</strong> {quizContext['duration'] || 'Not specified'}</p>
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
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                'Send'
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
          <h1 className="text-2xl font-bold">HealthBuddy</h1>
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