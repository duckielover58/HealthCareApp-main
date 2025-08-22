"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  Trash2,
  RefreshCw,
  History
} from "lucide-react"
import Header from "@/components/header"
import { getCurrentUser } from "@/lib/auth-service"

interface HistoryItem {
  id: string
  timestamp: string
  symptomType: string
  severity: string
  recommendations: string[]
  doctorReasons: string[]
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
      const user = await getCurrentUser()
      
      if (user) {
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
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Your Health History</h1>
        </div>

        {history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No History Yet</h3>
              <p className="text-gray-600 mb-4">
                Complete health assessments to see your history here.
              </p>
              <Button onClick={() => router.push('/quiz')}>
                Take Health Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Assessments</h2>
              <Button variant="outline" onClick={clearHistory} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
            
            {history.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getSeverityColor(item.severity)} flex items-center gap-1`}>
                        {item.severity === 'emergency' || item.severity === 'serious' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : item.severity === 'moderate' ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{item.symptomType}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {item.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
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
                          <span className="text-red-600 mt-1">•</span>
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
