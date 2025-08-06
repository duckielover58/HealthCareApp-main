"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Shield,
  Trash2,
  RefreshCw
} from "lucide-react"
import Header from "@/components/header"

interface HistoryItem {
  id: string
  timestamp: string
  symptoms: string
  severity: string
  recommendations: string[]
  doctorReasons: string[]
  explanation: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthAndLoadHistory()
  }, [])

  const checkAuthAndLoadHistory = async () => {
    try {
      const response = await fetch('/api/auth')
      const data = await response.json()
      
      if (data.authenticated) {
        setIsAuthenticated(true)
        // In a real app, you'd fetch history from an API
        // For now, we'll use sessionStorage
        const savedHistory = sessionStorage.getItem('healthHistory')
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory))
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    sessionStorage.removeItem('healthHistory')
    setHistory([])
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          
          {history.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearHistory}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </Button>
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health History</h1>
          <p className="text-gray-600">
            Your past symptom assessments and recommendations
          </p>
        </div>

        {history.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
                <p className="text-gray-600 mb-6">
                  Your health assessments will appear here once you start using the app.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => router.push('/chat')}>
                    Start Chat
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/quiz')}>
                    Take Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getSeverityColor(item.severity)} flex items-center gap-1`}>
                        {getSeverityIcon(item.severity)}
                        {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">Symptoms</CardTitle>
                  <CardDescription>{item.symptoms}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">What was happening:</h4>
                    <p className="text-sm text-gray-700">{item.explanation}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {item.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">When to see a doctor:</h4>
                    <ul className="space-y-1">
                      {item.doctorReasons.map((reason, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
