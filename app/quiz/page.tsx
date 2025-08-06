"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Shield,
  RefreshCw
} from "lucide-react"
import Header from "@/components/header"
import { getSymptomAdvice } from "@/lib/symptom-service"

interface Question {
  id: string
  question: string
  options: string[]
  category: string
}

interface QuizState {
  currentStep: number
  answers: Record<string, string>
  symptoms: string[]
}

const questions: Question[] = [
  {
    id: "symptom-type",
    question: "What type of problem are you experiencing?",
    options: ["Pain", "Fever", "Cough/Cold", "Stomach Issues", "Skin Problems", "Injury", "Other"],
    category: "symptom"
  },
  {
    id: "location",
    question: "Where on your body is the problem?",
    options: ["Head", "Throat", "Chest", "Stomach", "Arm/Hand", "Leg/Foot", "Back", "All over"],
    category: "location"
  },
  {
    id: "severity",
    question: "How bad is it?",
    options: ["Mild - annoying but manageable", "Moderate - uncomfortable", "Severe - very painful", "Emergency - can't function"],
    category: "severity"
  },
  {
    id: "duration",
    question: "How long have you had this problem?",
    options: ["Just started (less than 1 hour)", "A few hours", "A day or two", "Several days", "A week or more"],
    category: "duration"
  },
  {
    id: "additional",
    question: "Are you experiencing any of these additional symptoms?",
    options: ["Fever", "Nausea/Vomiting", "Dizziness", "Difficulty breathing", "None of these"],
    category: "additional"
  }
]

export default function QuizPage() {
  const router = useRouter()
  const [quizState, setQuizState] = useState<QuizState>({
    currentStep: 0,
    answers: {},
    symptoms: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [advice, setAdvice] = useState<any>(null)

  const currentQuestion = questions[quizState.currentStep]
  const progress = ((quizState.currentStep + 1) / questions.length) * 100

  const handleAnswer = (answer: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: answer }
    }))
  }

  const nextStep = () => {
    if (quizState.currentStep < questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }))
    } else {
      generateAdvice()
    }
  }

  const prevStep = () => {
    if (quizState.currentStep > 0) {
      setQuizState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }))
    }
  }

  const generateAdvice = async () => {
    setIsLoading(true)
    
    // Build symptom description from answers
    const symptomDescription = buildSymptomDescription()
    
    try {
      const result = await getSymptomAdvice(symptomDescription)
      setAdvice(result)

      // Save to history
      const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        symptoms: symptomDescription,
        severity: result.severity,
        recommendations: result.recommendations,
        doctorReasons: result.doctorReasons,
        explanation: result.explanation
      }

      const existingHistory = sessionStorage.getItem('healthHistory')
      const history = existingHistory ? JSON.parse(existingHistory) : []
      history.unshift(historyItem)
      sessionStorage.setItem('healthHistory', JSON.stringify(history))
    } catch (error) {
      console.error('Error getting advice:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const buildSymptomDescription = () => {
    const answers = quizState.answers
    let description = "I have "
    
    if (answers["symptom-type"]) {
      description += answers["symptom-type"].toLowerCase()
    }
    
    if (answers["location"]) {
      description += ` in my ${answers["location"].toLowerCase()}`
    }
    
    if (answers["severity"]) {
      description += `. The severity is ${answers["severity"].toLowerCase()}`
    }
    
    if (answers["duration"]) {
      description += `. This has been going on for ${answers["duration"].toLowerCase()}`
    }
    
    if (answers["additional"] && answers["additional"] !== "None of these") {
      description += `. I also have ${answers["additional"].toLowerCase()}`
    }
    
    return description
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200'
      case 'serious': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'mild': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />
      case 'serious': return <AlertTriangle className="w-4 h-4" />
      case 'moderate': return <Clock className="w-4 h-4" />
      case 'mild': return <CheckCircle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const restartQuiz = () => {
    setQuizState({
      currentStep: 0,
      answers: {},
      symptoms: []
    })
    setAdvice(null)
  }

  if (advice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={restartQuiz}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start Over
                </Button>
              </div>
              <CardTitle className="text-2xl">Your Health Assessment</CardTitle>
              <CardDescription>
                Based on your answers, here's what we found:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Severity Badge */}
              <div className="flex justify-center">
                <Badge className={`${getSeverityColor(advice.severity)} flex items-center gap-2 px-4 py-2 text-base`}>
                  {getSeverityIcon(advice.severity)}
                  {advice.severity.charAt(0).toUpperCase() + advice.severity.slice(1)} Severity
                </Badge>
              </div>

              {/* Explanation */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What's happening:</h3>
                <p className="text-sm text-gray-700">{advice.explanation}</p>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold mb-3">What you can do:</h3>
                <ul className="space-y-2">
                  {advice.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Doctor Reasons */}
              <div>
                <h3 className="font-semibold mb-3 text-red-600">See a doctor if:</h3>
                <ul className="space-y-2">
                  {advice.doctorReasons.map((reason: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => router.push('/chat')} 
                  className="flex-1"
                  variant="outline"
                >
                  Chat with AI for More Help
                </Button>
                <Button 
                  onClick={() => router.push('/history')} 
                  className="flex-1"
                >
                  Save to History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <span className="text-sm text-gray-500">
                Step {quizState.currentStep + 1} of {questions.length}
              </span>
            </div>
            
            <Progress value={progress} className="mb-4" />
            
            <CardTitle className="text-xl">
              {currentQuestion.question}
            </CardTitle>
            <CardDescription>
              Select the option that best describes your situation
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option) => (
                <Button
                  key={option}
                  variant={quizState.answers[currentQuestion.id] === option ? "default" : "outline"}
                  className="w-full justify-start h-auto p-4 text-left"
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={quizState.currentStep === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={!quizState.answers[currentQuestion.id]}
                className="flex items-center gap-2"
              >
                {quizState.currentStep === questions.length - 1 ? (
                  <>
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Get Advice
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 