"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Brain
} from "lucide-react"
import Header from "@/components/header"

interface Question {
  id: string
  question: string
  options: string[]
  category: string
}

interface QuizState {
  currentStep: number
  answers: Record<string, string>
}

const baseQuestions: Question[] = [
  {
    id: "symptom-type",
    question: "What type of health issue are you experiencing?",
    options: ["Fever", "Cough/Cold", "Stomach Issues", "Pain", "Skin Problems", "Injury", "Other"],
    category: "type"
  }
]

export default function QuizPage() {
  const router = useRouter()
  const [quizState, setQuizState] = useState<QuizState>({
    currentStep: 0,
    answers: {}
  })
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(baseQuestions)
  const [showAdvice, setShowAdvice] = useState(false)

  const handleAnswer = (answer: string) => {
    const currentQuestion = activeQuestions[quizState.currentStep]
    const newAnswers = { ...quizState.answers, [currentQuestion.id]: answer }
    
    setQuizState(prev => ({
      ...prev,
      answers: newAnswers,
      currentStep: prev.currentStep + 1
    }))

    // Add follow-up questions based on the answer
    if (currentQuestion.id === "symptom-type") {
      const followUpQuestions = getFollowUpQuestions(answer)
      setActiveQuestions([...baseQuestions, ...followUpQuestions])
    }
  }

  const getFollowUpQuestions = (symptomType: string): Question[] => {
    switch (symptomType.toLowerCase()) {
      case "fever":
        return [
          {
            id: "fever-severity",
            question: "How high is the fever?",
            options: [
              "Low (99–100.4°F / 37.2–38°C)",
              "Moderate (100.4–102.2°F / 38–39°C)",
              "High (102.2–104°F / 39–40°C)",
              "Very High (>104°F / >40°C)"
            ],
            category: "severity"
          },
          {
            id: "duration",
            question: "How long has the fever been present?",
            options: ["Less than 24 hours", "1–2 days", "3–4 days", "5+ days"],
            category: "duration"
          }
        ]
      case "cough":
      case "cold":
        return [
          {
            id: "cough-type",
            question: "What type of cough do you have?",
            options: ["Dry cough", "Wet cough with mucus", "Barking cough", "Cough with wheezing"],
            category: "type"
          },
          {
            id: "duration",
            question: "How long have you been coughing?",
            options: ["Less than 1 week", "1-2 weeks", "2-4 weeks", "More than 4 weeks"],
            category: "duration"
          }
        ]
      case "stomach":
        return [
          {
            id: "stomach-type",
            question: "What stomach symptoms do you have?",
            options: ["Nausea", "Vomiting", "Diarrhea", "Stomach pain", "Loss of appetite"],
            category: "type"
          },
          {
            id: "duration",
            question: "How long have you had these symptoms?",
            options: ["Less than 24 hours", "1-2 days", "3-5 days", "More than 5 days"],
            category: "duration"
          }
        ]
      default:
        return [
          {
            id: "location",
            question: "Where on your body is the problem?",
            options: ["Head", "Throat", "Chest", "Stomach", "Arm/Hand", "Leg/Foot", "Back", "All over"],
            category: "location"
          },
          {
            id: "severity",
            question: "How bad is it?",
            options: [
              "Mild - annoying but manageable",
              "Moderate - uncomfortable",
              "Severe - very painful",
              "Emergency - can't function"
            ],
            category: "severity"
          }
        ]
    }
  }

  const getAdvice = () => {
    const answers = quizState.answers
    const symptomType = answers["symptom-type"]?.toLowerCase()
    
    if (symptomType === "fever") {
      const severity = answers["fever-severity"]
      if (severity?.includes("Very High") || severity?.includes("High")) {
        return {
          severity: "serious",
          recommendations: [
            "Seek immediate medical attention",
            "Call your doctor or go to urgent care",
            "Stay hydrated with water or clear fluids",
            "Rest and avoid physical activity"
          ],
          explanation: "High fevers can be serious and may indicate an infection that needs medical treatment.",
          doctorReasons: [
            "High fever can be dangerous",
            "May indicate serious infection",
            "Requires medical evaluation",
            "Could need prescription medication"
          ]
        }
      }
      return {
        severity: "moderate",
        recommendations: [
          "Rest and stay hydrated",
          "Take acetaminophen or ibuprofen as directed",
          "Monitor temperature regularly",
          "Stay in a cool environment"
        ],
        explanation: "Low to moderate fevers often resolve with rest and over-the-counter medication.",
        doctorReasons: [
          "Fever lasts more than 3 days",
          "Fever gets higher",
          "You develop other symptoms",
          "You feel much worse"
        ]
      }
    }
    
    return {
      severity: "moderate",
      recommendations: [
        "Rest and take it easy",
        "Stay hydrated with water",
        "Monitor your symptoms",
        "Contact a healthcare provider if symptoms worsen"
      ],
      explanation: "Your symptoms may resolve with rest and time. Monitor for any changes.",
      doctorReasons: [
        "Symptoms don't improve after 2-3 days",
        "Symptoms get worse",
        "You develop a high fever",
        "You feel much sicker than before"
      ]
    }
  }

  const currentQuestion = activeQuestions[quizState.currentStep]
  const advice = getAdvice()

  if (showAdvice) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setShowAdvice(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Quiz
            </Button>
            <h1 className="text-3xl font-bold">Your Health Assessment</h1>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${
                  advice.severity === 'serious' ? 'bg-red-100 text-red-800' :
                  advice.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                } flex items-center gap-1`}>
                  {advice.severity === 'serious' ? <AlertTriangle className="w-4 h-4" /> :
                   advice.severity === 'moderate' ? <Clock className="w-4 h-4" /> :
                   <CheckCircle className="w-4 h-4" />}
                  {advice.severity.charAt(0).toUpperCase() + advice.severity.slice(1)}
                </Badge>
              </div>
              <CardTitle>What's happening</CardTitle>
              <CardDescription>{advice.explanation}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Recommendations:</h4>
                <ul className="space-y-2">
                  {advice.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-red-600">When to see a doctor:</h4>
                <ul className="space-y-2">
                  {advice.doctorReasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => setShowAdvice(false)} variant="outline">
              Take Quiz Again
            </Button>
            <Button onClick={() => router.push('/chat')} className="flex-1">
              Chat with AI for More Help
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Quiz Complete!</h1>
          <p className="text-muted-foreground mb-6">
            Based on your answers, we have some recommendations for you.
          </p>
          <Button onClick={() => setShowAdvice(true)} size="lg">
            View Your Assessment
          </Button>
        </div>
      </div>
    )
  }

  const question = activeQuestions[quizState.currentStep]
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Health Assessment Quiz</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">{question.question}</h2>
            
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 text-left"
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 