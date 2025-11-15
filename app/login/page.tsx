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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
      <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <a 
            href="/"
            className="text-3xl font-bold cursor-pointer hover:scale-105 transition-transform"
          >
            🌟 HealthBuddy 🌟
          </a>
        </div>
      </header>
      <main className="container px-4 py-8 mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                Welcome to HealthBuddy! 🎉
              </h1>
              <p className="text-lg text-gray-700 font-medium">
                Sign in to access your personalized health history and get better recommendations
              </p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl border-4 border-cyan-200 p-6">
              <AuthForm onSuccess={handleAuthSuccess} />
            </div>
            
            <div className="mt-8 text-center text-sm text-teal-700 font-medium">
              <p>
                🔒 Your health data is encrypted and protected. We never share your information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 