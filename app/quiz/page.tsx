"use client"

import { useState } from "react"

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

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

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer }
    setAnswers(newAnswers)
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz complete - show results
      alert("Quiz complete! Your answers: " + JSON.stringify(newAnswers, null, 2))
    }
  }

  if (currentQuestion >= questions.length) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">HealthBuddy</h1>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
          <p className="text-gray-600 mb-6">Based on your answers, we have some recommendations for you.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">HealthBuddy</h1>
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
                  onClick={() => handleAnswer(option)}
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