"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MessageCircle, 
  ClipboardList, 
  Shield, 
  Zap,
  Heart,
  Brain,
  Smartphone,
  Lock
} from "lucide-react"
import Header from "@/components/header"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Your Personal
            <span className="text-primary"> Health Assistant</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get instant health guidance, track your symptoms, and make informed decisions about your well-being with AI-powered insights.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/quiz">
              <Button size="lg">
                Start Health Quiz
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="outline" size="lg">
                Chat with AI
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <MessageCircle className="w-12 h-12 text-primary mb-4" />
              <CardTitle>AI-Powered Chat</CardTitle>
              <CardDescription>
                Get personalized health advice through natural conversation with our advanced AI assistant.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ClipboardList className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Guided Health Quiz</CardTitle>
              <CardDescription>
                Answer simple questions to get targeted health recommendations and next steps.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Your health data stays private and secure with end-to-end encryption and local storage.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Instant Results</CardTitle>
              <CardDescription>
                Get immediate guidance and recommendations without waiting for appointments.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="w-12 h-12 text-primary mb-4" />
              <CardTitle>User-Friendly</CardTitle>
              <CardDescription>
                Simple language and guided questions designed for everyone.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Smart Insights</CardTitle>
              <CardDescription>
                AI analyzes your symptoms and provides evidence-based health recommendations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-muted/50 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your health?</h2>
          <p className="text-muted-foreground mb-6">
            Start your health journey today with personalized guidance and support.
          </p>
          <Button onClick={() => router.push('/quiz')} size="lg">
            Get Started Now
          </Button>
        </div>
      </main>
    </div>
  )
}
