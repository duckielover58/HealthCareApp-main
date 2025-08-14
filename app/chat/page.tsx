"use client"

import { useState, useRef, useEffect } from "react"
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
import { getSymptomAdviceClient } from "@/lib/client-api"
import CameraPrivacyNotice from "@/components/camera-privacy-notice"

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

export default function ChatPage() {
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
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false)
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

  const handleCameraClick = () => {
    setShowPrivacyNotice(true)
  }

  const handlePrivacyAccept = () => {
    setShowPrivacyNotice(false)
    setShowCamera(true)
  }

  const handlePrivacyDecline = () => {
    setShowPrivacyNotice(false)
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

    try {
      // Build conversation context for the AI
      let conversationContext = ""
      if (messages.length > 1) { // Skip the initial welcome message
        const recentMessages = messages.slice(1).map(msg => 
          `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n')
        conversationContext = `Previous conversation:\n${recentMessages}\n\n`
      }

      let symptomDescription = input.trim()
      
      // Add quiz context to provide personalized advice
      if (quizContext) {
        const contextInfo = []
        if (quizContext.symptomType) {
          contextInfo.push(`Primary symptom: ${quizContext.symptomType}`)
        }
        if (quizContext.severity) {
          contextInfo.push(`Severity: ${quizContext.severity}`)
        }
        if (quizContext.duration) {
          contextInfo.push(`Duration: ${quizContext.duration}`)
        }
        if (quizContext.location && quizContext.location !== 'All over') {
          contextInfo.push(`Location: ${quizContext.location}`)
        }
        
        if (contextInfo.length > 0) {
          symptomDescription = `Context from recent health assessment: ${contextInfo.join(', ')}. ${symptomDescription ? 'Additional details: ' + symptomDescription : ''}`
        }
      }
      
      // Combine conversation context with current request
      const fullPrompt = `${conversationContext}Current request: ${symptomDescription}`
      
      // If there's an image, add image analysis to the description
      if (capturedImage) {
        symptomDescription = `${symptomDescription ? symptomDescription + '. ' : ''}Please analyze this image for visible symptoms, injuries, rashes, or other health concerns.`
      }

      const advice = await getSymptomAdviceClient(symptomDescription, capturedImage || undefined)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: advice.explanation || "I've analyzed your symptoms and here's what I found:",
        timestamp: new Date(),
        severity: advice.severity,
        recommendations: advice.recommendations,
        doctorReasons: advice.doctorReasons,
        explanation: advice.explanation
      }

      setMessages(prev => [...prev, assistantMessage])
      setCapturedImage(null) // Clear the image after sending

      // Save to history
      const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        symptoms: symptomDescription,
        severity: advice.severity,
        recommendations: advice.recommendations,
        doctorReasons: advice.doctorReasons,
        explanation: advice.explanation,
        hasImage: !!capturedImage,
        quizContext: quizContext // Include quiz context in history
      }

      const existingHistory = sessionStorage.getItem('healthHistory')
      const history = existingHistory ? JSON.parse(existingHistory) : []
      history.unshift(historyItem)
      sessionStorage.setItem('healthHistory', JSON.stringify(history))
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble analyzing your symptoms right now. Please try again or use the guided quiz option.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
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
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'mild': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />
      case 'moderate': return <Clock className="w-4 h-4" />
      case 'mild': return <CheckCircle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  // Check if the current context involves private areas or bodily fluids
  const shouldDisableImageCapture = (): boolean => {
    if (!quizContext) return false
    
    const { symptomType, location } = quizContext
    
    // Private body areas
    const privateAreas = ['genitals', 'private parts', 'intimate areas', 'breasts', 'buttocks']
    if (location && privateAreas.some(area => location.toLowerCase().includes(area))) {
      return true
    }
    
    // Bodily fluids (excluding snot and saliva)
    const bodilyFluids = ['blood', 'urine', 'feces', 'stool', 'vomit', 'pus', 'discharge', 'semen', 'vaginal fluid']
    const symptomText = symptomType?.toLowerCase() || ''
    
    if (bodilyFluids.some(fluid => symptomText.includes(fluid))) {
      return true
    }
    
    // Check for specific symptoms that involve bodily fluids
    const fluidRelatedSymptoms = ['bleeding', 'hemorrhage', 'incontinence', 'diarrhea', 'constipation', 'vomiting']
    if (fluidRelatedSymptoms.some(symptom => symptomText.includes(symptom))) {
      return true
    }
    
    return false
  }

  const isImageCaptureDisabled = shouldDisableImageCapture()

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

      {/* Privacy Notice */}
      {showPrivacyNotice && (
        <CameraPrivacyNotice
          onAccept={handlePrivacyAccept}
          onDecline={handlePrivacyDecline}
        />
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
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-blue-600" />
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Analyzing your symptoms...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {capturedImage && (
        <div className="fixed bottom-20 left-4 right-4 max-w-4xl mx-auto">
          <Card className="bg-white border-2 border-blue-500">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="text-sm text-gray-600 flex-1">Photo ready to send</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Context Indicator */}
          {quizContext && (
            <div 
              className={`mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg transition-all duration-500 ease-in-out ${
                showContextPopup ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0 overflow-hidden'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Personalized Context Available</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContextPopup(false)}
                  className="text-blue-600 hover:text-blue-800 p-1 h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                I have access to your recent health assessment and can provide tailored advice for your {quizContext.symptomType?.toLowerCase() || 'symptoms'}.
              </div>
            </div>
          )}
          
          {/* Image Controls */}
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCameraClick}
              disabled={isImageCaptureDisabled}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Camera
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImageCaptureDisabled}
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
          </div>
          
          {/* Explanation for disabled image capture */}
          {isImageCaptureDisabled && (
            <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
              📷 Image capture is disabled for privacy and safety reasons related to your symptoms.
            </div>
          )}
          
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms or take a photo..."
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
        </div>
      </div>
    </div>
  )
} 