"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  ArrowLeft, 
  Bot, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Shield,
  Camera,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react"
import Header from "@/components/header"

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  severity?: 'mild' | 'moderate' | 'serious' | 'emergency'
  recommendations?: string[]
  doctorReasons?: string[]
  explanation?: string
  image?: string // Base64 image data
}

interface QuizContext {
  answers: Record<string, string>
  symptomType?: string
  severity?: string
  duration?: string
  location?: string
}

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [quizContext, setQuizContext] = useState<QuizContext | null>(null)
  const [showContextPopup, setShowContextPopup] = useState(true)
  
  // Get quiz data from URL if available
  useEffect(() => {
    const quizParam = searchParams.get('quiz')
    if (quizParam) {
      try {
        const quizData = JSON.parse(decodeURIComponent(quizParam))
        setQuizContext(quizData)
        // Auto-hide context popup after 5 seconds
        const timer = setTimeout(() => {
          setShowContextPopup(false)
        }, 5000)
        return () => clearTimeout(timer)
      } catch (error) {
        console.error('Error parsing quiz data:', error)
      }
    }
  }, [searchParams])

  // Generate personalized welcome message based on quiz context
  const getWelcomeMessage = (): string => {
    if (!quizContext) {
      return "Hi! I'm your health assistant. I'm here to help you understand your symptoms and provide guidance. You can describe your symptoms in text or take a photo for visual analysis. What's bothering you today?"
    }

    const { symptomType, severity, duration, location } = quizContext
    let message = `Hi! I see you recently completed a health assessment about ${symptomType?.toLowerCase() || 'your symptoms'}. `
    
    if (severity) {
      message += `Based on your answers, this appears to be ${severity.toLowerCase()} in severity. `
    }
    
    if (duration) {
      message += `You mentioned this has been going on for ${duration.toLowerCase()}. `
    }
    
    if (location && location !== 'All over') {
      message += `The problem is located in your ${location.toLowerCase()}. `
    }
    
    message += `I'm here to provide personalized follow-up advice and answer any additional questions you might have. You can also take photos for visual analysis. What would you like to know more about?`
    
    return message
  }

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize messages with personalized welcome message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      }
    ])
  }, [quizContext])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (showCamera) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [showCamera])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
      setShowCamera(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true)
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      if (context) {
        context.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageData)
        setShowCamera(false)
        stopCamera()
      }
      setIsCapturing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCapturedImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setCapturedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const handleSend = async () => {
    if ((!input.trim() && !capturedImage) || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim() || (capturedImage ? "Analyze this image for health symptoms" : ""),
      timestamp: new Date(),
      image: capturedImage || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input.trim())
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const generateAIResponse = (userInput: string): Message => {
    // Simple rule-based response system
    const input = userInput.toLowerCase()
    
    if (input.includes('fever') || input.includes('temperature')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I understand you're experiencing a fever. This is a common symptom that can indicate various conditions. Let me provide some guidance.",
        timestamp: new Date(),
        severity: 'moderate',
        recommendations: [
          "Rest and stay hydrated with water or clear fluids",
          "Take acetaminophen or ibuprofen as directed",
          "Monitor your temperature regularly",
          "Stay in a cool environment"
        ],
        explanation: "Fever is your body's natural response to infection or illness.",
        doctorReasons: [
          "Fever above 103°F (39.4°C)",
          "Fever lasting more than 3 days",
          "Fever with severe headache or neck stiffness",
          "Fever with rash"
        ]
      }
    }
    
    if (input.includes('cough') || input.includes('cold')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Cough and cold symptoms are very common and usually resolve on their own. Here's what you can do to feel better.",
        timestamp: new Date(),
        severity: 'mild',
        recommendations: [
          "Rest and get plenty of sleep",
          "Stay hydrated with warm fluids",
          "Use honey for cough relief (for ages 1+)",
          "Use saline nasal drops for congestion"
        ],
        explanation: "Most colds are caused by viruses and resolve within 7-10 days.",
        doctorReasons: [
          "Cough lasting more than 2 weeks",
          "Difficulty breathing or wheezing",
          "High fever with cough",
          "Cough with chest pain"
        ]
      }
    }
    
    if (input.includes('stomach') || input.includes('nausea') || input.includes('vomit')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Stomach issues can be uncomfortable but are often manageable at home. Let me provide some guidance.",
        timestamp: new Date(),
        severity: 'moderate',
        recommendations: [
          "Rest your stomach - avoid solid foods for a few hours",
          "Sip clear fluids like water, broth, or electrolyte solutions",
          "Start with bland foods like crackers or toast",
          "Avoid dairy, fatty foods, and caffeine"
        ],
        explanation: "Stomach upset often resolves with rest and proper hydration.",
        doctorReasons: [
          "Severe abdominal pain",
          "Blood in vomit or stool",
          "Signs of dehydration",
          "Symptoms lasting more than 24 hours"
        ]
      }
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: "I understand your concern. While I can provide general guidance, it's important to consult with a healthcare provider for personalized medical advice. Your symptoms may resolve with rest and time. Monitor for any changes and seek medical attention if symptoms worsen.",
      timestamp: new Date(),
      severity: 'moderate',
      recommendations: [
        "Rest and take it easy",
        "Stay hydrated with water",
        "Monitor your symptoms",
        "Contact a healthcare provider if symptoms worsen"
      ],
      explanation: "General symptoms often resolve with rest and time.",
      doctorReasons: [
        "Symptoms don't improve after 2-3 days",
        "Symptoms get worse",
        "You develop a high fever",
        "You feel much sicker than before"
      ]
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
      default: return <Bot className="w-4 h-4" />
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Health Assistant</span>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Quiz Context Popup */}
      {showContextPopup && quizContext && (
        <div className="bg-blue-50 border border-blue-200 p-4 mx-4 mt-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Quiz Context Available</h4>
              <p className="text-sm text-blue-700 mb-2">
                I can see you recently completed a health assessment. I'll use this information to provide more personalized advice.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowContextPopup(false)}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Take a Photo</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCamera(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={captureImage}
                disabled={isCapturing}
                className="flex-1"
              >
                {isCapturing ? 'Capturing...' : 'Take Photo'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCamera(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-40">
        <div className="space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <Card className={`${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {message.type === 'assistant' && (
                        <Bot className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        {message.image && (
                          <div className="mb-3">
                            <img 
                              src={message.image} 
                              alt="Symptom photo" 
                              className="max-w-full h-auto rounded-lg border"
                            />
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        
                        {message.severity && (
                          <div className="mt-3">
                            <Badge className={`${getSeverityColor(message.severity)} flex items-center gap-1 w-fit`}>
                              {getSeverityIcon(message.severity)}
                              {message.severity.charAt(0).toUpperCase() + message.severity.slice(1)} Severity
                            </Badge>
                          </div>
                        )}

                        {message.recommendations && message.recommendations.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-semibold text-sm mb-2">What you can do:</h4>
                            <ul className="space-y-1">
                              {message.recommendations.map((rec, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {message.doctorReasons && message.doctorReasons.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-semibold text-sm mb-2 text-red-600">See a doctor if:</h4>
                            <ul className="space-y-1">
                              {message.doctorReasons.map((reason, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <span className="text-red-600 mt-1">•</span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {message.type === 'user' && (
                        <User className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
                <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
        
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              disabled={(!input.trim() && !capturedImage) || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Image Controls */}
          <div className="max-w-4xl mx-auto flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCamera(true)}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Camera
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {capturedImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={removeImage}
                className="flex items-center gap-2 text-red-600"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            )}
          </div>
          
          {capturedImage && (
            <div className="max-w-4xl mx-auto mt-2">
              <div className="relative inline-block">
                <img 
                  src={capturedImage} 
                  alt="Captured symptom" 
                  className="max-h-32 rounded-lg border"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  )
} 