"use client"

import { useMemo, useState, useEffect } from "react"
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
import { getSymptomAdviceClient } from "@/lib/client-api"
import { fetchNextQuestions } from "@/lib/quiz-service"

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

const baseQuestions: Question[] = [
  {
    id: "symptom-type",
    question: "What type of problem are you experiencing?",
    options: ["Pain", "Fever", "Cough/Cold", "Stomach Issues", "Skin Problems", "Injury", "Other"],
    category: "symptom"
  },
  // The rest of the questions will be determined dynamically based on answers
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
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(baseQuestions)

  const currentQuestion = activeQuestions[quizState.currentStep]
  const progress = useMemo(() => ((quizState.currentStep + 1) / activeQuestions.length) * 100, [quizState.currentStep, activeQuestions.length])

  // Handle location-based question adaptation
  useEffect(() => {
    if (currentQuestion?.id === "location" && quizState.answers["location"]) {
      const symptom = (quizState.answers["symptom-type"] || "").toLowerCase()
      const loc = (quizState.answers["location"] || "").toLowerCase()

      let followUps: Question[] = []

      if (symptom === "pain") {
        followUps = [
          {
            id: "pain-character",
            question: `What does the ${loc || "pain"} feel like?`,
            options: ["Sharp", "Dull/aching", "Throbbing", "Burning", "Cramping"],
            category: "detail"
          },
          {
            id: "pain-onset",
            question: "How did it start?",
            options: ["Suddenly", "Gradually", "After an injury", "Unsure"],
            category: "detail"
          },
          {
            id: "pain-aggravators",
            question: "What makes it worse?",
            options: ["Movement", "Touch/pressure", "Eating", "Breathing", "Nothing specific"],
            category: "detail"
          }
        ]
      } else if (symptom === "injury") {
        followUps = [
          {
            id: "injury-mechanism",
            question: "How did the injury happen?",
            options: ["Fall", "Twisted", "Hit by object", "Sports", "Other"],
            category: "detail"
          },
          {
            id: "injury-signs",
            question: "Do you notice any of these?",
            options: ["Swelling", "Bruising", "Deformity", "Can't bear weight", "None of these"],
            category: "detail"
          }
        ]
      } else if (symptom === "skin problems") {
        followUps = [
          {
            id: "skin-appearance",
            question: "What does the skin look like?",
            options: ["Red rash", "Hives", "Blister", "Peeling", "Warm/red area"],
            category: "detail"
          },
          {
            id: "skin-symptoms",
            question: "Any of these with it?",
            options: ["Itchy", "Painful", "Spreading quickly", "Pus/drainage", "None of these"],
            category: "detail"
          }
        ]
      }

      if (followUps.length > 0) {
        const prefix = activeQuestions.slice(0, quizState.currentStep + 1)
        setActiveQuestions([...prefix, ...followUps])
      }
    }
  }, [quizState.answers["location"], quizState.answers["symptom-type"], currentQuestion?.id, quizState.currentStep, activeQuestions])

  const handleAnswer = (answer: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: answer }
    }))

    // Adapt the remaining flow after the first step(s)
    if (currentQuestion.id === "symptom-type") {
      const symptom = answer.toLowerCase()

      if (symptom === "fever") {
        // Fever flow: skip location, use temperature-focused severity
        setActiveQuestions([
          baseQuestions[0],
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
          },
          {
            id: "additional",
            question: "Any of these with the fever?",
            options: [
              "Stiff neck",
              "Severe headache",
              "Rash",
              "Trouble breathing",
              "None of these"
            ],
            category: "additional"
          }
        ])
        return
      }

      if (symptom === "cough/cold") {
        setActiveQuestions([
          baseQuestions[0],
          {
            id: "cough-type",
            question: "What best describes the cough/cold?",
            options: [
              "Dry cough",
              "Wet/productive cough",
              "Sore throat",
              "Runny or stuffy nose"
            ],
            category: "symptom-detail"
          },
          {
            id: "duration",
            question: "How long have you had these symptoms?",
            options: ["< 24 hours", "1–3 days", "4–7 days", "Over a week"],
            category: "duration"
          },
          {
            id: "additional",
            question: "Any of these additional symptoms?",
            options: ["Fever", "Chest pain", "Wheezing", "None of these"],
            category: "additional"
          }
        ])
        return
      }

      if (symptom === "stomach issues") {
        setActiveQuestions([
          baseQuestions[0],
          {
            id: "gi-symptoms",
            question: "Which of these do you have?",
            options: ["Nausea", "Vomiting", "Diarrhea", "Constipation", "Loss of appetite"],
            category: "symptom-detail"
          },
          {
            id: "gi-pain-type",
            question: "What type of stomach discomfort?",
            options: ["Cramping", "Sharp pain", "Dull ache", "Burning", "No pain"],
            category: "symptom-detail"
          },
          {
            id: "duration",
            question: "How long have you had these symptoms?",
            options: ["Just started", "A few hours", "A day or two", "Several days", "A week or more"],
            category: "duration"
          },
          {
            id: "additional",
            question: "Any of these additional symptoms?",
            options: [
              "Fever",
              "Dizziness",
              "Blood in stool",
              "Severe dehydration",
              "None of these"
            ],
            category: "additional"
          }
        ])
        return
      }

      // Pain/Injury/Skin: include location
      setActiveQuestions([
        baseQuestions[0],
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
          options: [
            "Fever",
            "Nausea/Vomiting",
            "Dizziness",
            "Difficulty breathing",
            "None of these"
          ],
          category: "additional"
        }
      ])
    }
    
    // For later steps, allow LLM to refine upcoming questions (best-effort)
    if (quizState.currentStep >= 1) {
      fetchNextQuestions({ ...quizState.answers, [currentQuestion.id]: answer }).then((data) => {
        if (data?.questions?.length) {
          // Keep prior answered questions, replace tail with LLM proposals
          const prefix = activeQuestions.slice(0, quizState.currentStep + 1)
          setActiveQuestions([...prefix, ...data.questions])
        }
      })
    }
  }

  const nextStep = () => {
    if (quizState.currentStep < activeQuestions.length - 1) {
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
      const result = await getSymptomAdviceClient(symptomDescription)
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
    
    if (answers["fever-severity"]) {
      description += `. The fever level is ${answers["fever-severity"].toLowerCase()}`
    } else if (answers["severity"]) {
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
      <div className="min-h-screen bg-background">
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
                  onClick={() => {
                    const quizData = encodeURIComponent(JSON.stringify(quizState.answers))
                    router.push(`/chat?quiz=${quizData}`)
                  }} 
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
    <div className="min-h-screen bg-background">
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
                Step {quizState.currentStep + 1} of {activeQuestions.length}
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
                {quizState.currentStep === activeQuestions.length - 1 ? (
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