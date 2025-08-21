"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Header from "@/components/header"
import AuthForm from "@/components/auth-form"
import { getCurrentUser } from "@/lib/auth-service"

export default function LoginPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = getCurrentUser()
        if (user) {
          router.push('/')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    
    checkAuth()
  }, [router])

  const handleAuthSuccess = () => {
    router.push('/')
  }

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="container px-4 py-8 mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to HealthBuddy
              </h1>
              <p className="text-gray-600">
                Sign in to access your personalized health history and get better recommendations
              </p>
            </div>
            
            <AuthForm onSuccess={handleAuthSuccess} />
            
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                Your health data is encrypted and protected. We never share your information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 