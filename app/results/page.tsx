"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, AlertTriangle, ThumbsUp, ThumbsDown, RefreshCw, MessageCircle } from "lucide-react"
import Header from "@/components/header"
import Disclaimer from "@/components/disclaimer"
import type { SymptomAdvice } from "@/lib/types"

export default function ResultsPage() {
  const router = useRouter()
  const [symptomInput, setSymptomInput] = useState("")
  const [advice, setAdvice] = useState<SymptomAdvice | null>(null)
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)

  useEffect(() => {
    // Retrieve data from session storage
    const storedInput = sessionStorage.getItem("symptomInput")
    const storedAdvice = sessionStorage.getItem("symptomAdvice")

    if (!storedInput || !storedAdvice) {
      router.push("/symptom")
      return
    }

    setSymptomInput(storedInput)
    setAdvice(JSON.parse(storedAdvice))
  }, [router])

  const handleFeedback = (helpful: boolean) => {
    // In a real app, this would send feedback to the server
    console.log(`User found advice ${helpful ? "helpful" : "not helpful"}`)
    setFeedbackGiven(true)
    
    // If feedback is negative, show follow-up options
    if (!helpful) {
      setShowFollowUp(true)
    }
  }

  const handleTryAgain = () => {
    router.push("/symptom")
  }

  if (!advice) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="container px-4 py-8 mx-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => router.push("/symptom")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Your Health Advice</CardTitle>
              <CardDescription>Based on: "{symptomInput}"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {advice.severity === "emergency" && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertTitle>Important!</AlertTitle>
                  <AlertDescription>This sounds serious. Please tell a parent or adult right away.</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="whatToDo">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="whatToDo">What To Do</TabsTrigger>
                  <TabsTrigger value="whyItHelps">Why It Helps</TabsTrigger>
                  <TabsTrigger value="whenToSeeDoctor">When To See Doctor</TabsTrigger>
                </TabsList>
                <TabsContent value="whatToDo" className="p-4 mt-2 border rounded-md">
                  <h3 className="mb-2 text-lg font-medium">Steps to take:</h3>
                  <ul className="pl-5 space-y-2 list-disc">
                    {advice.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="whyItHelps" className="p-4 mt-2 border rounded-md">
                  <p>{advice.explanation}</p>
                </TabsContent>
                <TabsContent value="whenToSeeDoctor" className="p-4 mt-2 border rounded-md">
                  <h3 className="mb-2 text-lg font-medium">Talk to a doctor if:</h3>
                  <ul className="pl-5 space-y-2 list-disc">
                    {advice.doctorReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>

              <Disclaimer />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full p-4 text-center border rounded-md">
                <p className="mb-2">Was this advice helpful?</p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedback(true)}
                    disabled={feedbackGiven}
                    className="gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" /> Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedback(false)}
                    disabled={feedbackGiven}
                    className="gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" /> No
                  </Button>
                </div>
                {feedbackGiven && <p className="mt-2 text-sm text-green-600">Thank you for your feedback!</p>}
              </div>

              {showFollowUp && (
                <div className="w-full p-4 border rounded-md bg-amber-50">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="w-4 h-4 text-amber-600" />
                    <h3 className="font-medium text-amber-800">Need more help?</h3>
                  </div>
                  <p className="mb-3 text-sm text-amber-700">
                    Since the advice wasn't helpful, here are your options:
                  </p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleTryAgain}
                      className="w-full justify-start text-amber-700 border-amber-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try describing your symptoms differently
                    </Button>
                    <div className="p-3 bg-white border border-amber-200 rounded-md">
                      <p className="text-sm font-medium text-amber-800 mb-1">Talk to a doctor</p>
                      <p className="text-xs text-amber-600">
                        If you're worried about your symptoms, it's always best to talk to a parent, guardian, or healthcare provider.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button variant="secondary" onClick={handleTryAgain} className="w-full gap-2">
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
