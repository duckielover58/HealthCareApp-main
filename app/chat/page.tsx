"use client"

import { useState } from "react"

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI health assistant. I can help you understand your symptoms and provide guidance. What health concerns do you have today?"
    }
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
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