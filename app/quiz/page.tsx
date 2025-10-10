"use client"

import { useState } from "react"
import { getSymptomAdviceClient } from "@/lib/client-api"
import type { SymptomAdvice } from "@/lib/types"

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState<'quiz' | 'results'>('quiz')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
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

  const handleAnswer = async (answer: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer }
    setAnswers(newAnswers)
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz complete - show results with AI advice
      setCurrentStep('results')
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

  // Results View
  if (currentStep === 'results') {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 
              className="text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors"
              onClick={() => window.location.href = '/'}
            >
              HealthBuddy
            </h1>
            <button 
              onClick={() => {
                setCurrentStep('quiz')
                setCurrentQuestion(0)
                setAnswers({})
                setAdvice(null)
                setIsLoading(false)
              }}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
            >
              Take Quiz Again
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
                      const quizContext = encodeURIComponent(JSON.stringify(answers))
                      window.location.href = `/chat?quiz=${quizContext}`
                    }}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    🤖 Chat with AI Assistant
                    <span className="text-sm opacity-90">(Get more help)</span>
                  </button>
                  <button 
                    onClick={() => window.location.href = '/'}
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

  const question = questions[currentQuestion]

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