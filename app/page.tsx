"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, ClipboardList, Shield, Brain, Heart } from "lucide-react"
import Header from "@/components/header"

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced LLM with medical knowledge for accurate symptom assessment"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "HIPAA Compliant",
      description: "Your health data is encrypted and protected with enterprise-grade security"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Child-Friendly",
      description: "Simple language and guided questions designed for young users"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Get immediate guidance whenever you need it, day or night"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="container px-4 py-8 mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personal Health Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant, reliable health guidance with our AI-powered symptom checker. 
            Safe, secure, and designed for the whole family.
          </p>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/chat')}>
            <CardHeader className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-2xl">Chat with AI</CardTitle>
              <CardDescription>
                Describe your symptoms in your own words and get personalized advice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Natural conversation with AI</li>
                <li>• Detailed symptom analysis</li>
                <li>• Follow-up questions</li>
                <li>• Treatment recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/quiz')}>
            <CardHeader className="text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle className="text-2xl">Guided Quiz</CardTitle>
              <CardDescription>
                Answer simple questions to help identify what's wrong
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Step-by-step symptom check</li>
                <li>• Easy multiple choice questions</li>
                <li>• Quick assessment</li>
                <li>• Structured guidance</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-blue-600 mb-3 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Safety Notice */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Important Safety Notice</h4>
                  <p className="text-sm text-yellow-700">
                    This app provides general health information and is not a substitute for professional medical advice. 
                    Always consult with a healthcare provider for serious symptoms or emergencies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
