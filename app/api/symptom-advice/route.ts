import { NextRequest, NextResponse } from 'next/server'
import type { SymptomAdvice } from '@/lib/types'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(ip)
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    console.log('API route called')
    
    // Check rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      console.error('Rate limit exceeded for IP:', ip)
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
    
    // Parse JSON with proper error handling
    let body;
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 })
    }
    
    const { symptomDescription, imageData } = body
    console.log('Received symptom description:', symptomDescription)
    
    if (!symptomDescription) {
      return NextResponse.json({ error: 'Symptom description is required' }, { status: 400 })
    }

    // Check for request size limits (1MB max)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      console.error('Request too large:', contentLength)
      return NextResponse.json({ error: 'Request too large (max 1MB)' }, { status: 413 })
    }
    
    // Additional check for body size (fallback)
    const bodyText = JSON.stringify(body)
    if (bodyText.length > 1024 * 1024) {
      console.error('Request body too large:', bodyText.length)
      return NextResponse.json({ error: 'Request too large (max 1MB)' }, { status: 413 })
    }

    // Try free AI APIs first, then fallback
    console.log('Attempting AI API calls for:', symptomDescription.substring(0, 100))
    
    // Try Hugging Face Inference API (free tier)
    try {
      const hfToken = process.env.HUGGINGFACE_TOKEN
      if (hfToken && hfToken !== 'hf_your_token_here') {
        console.log('Trying Hugging Face API...')
        const hfResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `You are a helpful health assistant for children. A child says: "${symptomDescription}". Provide brief, reassuring advice. Always mention seeing a doctor if needed.`
          })
        })

        if (hfResponse.ok) {
          const hfData = await hfResponse.json()
          console.log('Hugging Face response received')
          
          // Extract text from HF response
          const aiText = hfData[0]?.generated_text || hfData.generated_text || 'I understand your concern.'
          
          const response = NextResponse.json({
            severity: "moderate",
            recommendations: [
              "Rest and take it easy",
              "Drink plenty of water",
              "Tell an adult about your symptoms",
              "See a doctor if symptoms don't improve"
            ],
            explanation: aiText,
            doctorReasons: [
              "To get proper medical advice",
              "To rule out serious conditions",
              "To help you feel better faster"
            ],
            followUpQuestions: [
              "How are you feeling now?",
              "Have you told an adult about this?",
              "Do you have any other symptoms?"
            ],
            safetyNotes: "Remember, I'm here to help, but a real doctor can give you the best advice for your specific situation."
          })
          
          // Add CORS headers
          response.headers.set('Access-Control-Allow-Origin', '*')
          response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
          response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
          
          return response
        }
      }
    } catch (hfError) {
      console.log('Hugging Face API failed:', hfError.message)
    }

    // Try Google Gemini API (if key is provided)
    try {
      const geminiKey = process.env.GEMINI_API_KEY
      if (geminiKey) {
        console.log('Trying Google Gemini API...')
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a helpful health assistant for children ages 8-15. A child says: "${symptomDescription}". Provide brief, reassuring advice in simple language. Always mention seeing a doctor if needed. Keep your response under 200 words and be encouraging.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            }
          })
        })

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json()
          console.log('Google Gemini response received')
          
          const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand your concern.'
          
          const response = NextResponse.json({
            severity: "moderate",
            recommendations: [
              "Rest and take it easy",
              "Drink plenty of water",
              "Tell an adult about your symptoms",
              "See a doctor if symptoms don't improve"
            ],
            explanation: aiText,
            doctorReasons: [
              "To get proper medical advice",
              "To rule out serious conditions",
              "To help you feel better faster"
            ],
            followUpQuestions: [
              "How are you feeling now?",
              "Have you told an adult about this?",
              "Do you have any other symptoms?"
            ],
            safetyNotes: "Remember, I'm here to help, but a real doctor can give you the best advice for your specific situation."
          })
          
          // Add CORS headers
          response.headers.set('Access-Control-Allow-Origin', '*')
          response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
          response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
          
          return response
        }
      }
    } catch (geminiError) {
      console.log('Google Gemini API failed:', geminiError.message)
    }

    // Try OpenAI API (if key is provided)
    try {
      const openaiKey = process.env.OPENAI_API_KEY
      if (openaiKey) {
        console.log('Trying OpenAI API...')
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a helpful health assistant for children ages 8-15. Provide brief, reassuring advice in simple language. Always mention seeing a doctor if needed. Keep responses under 200 words."
              },
              {
                role: "user",
                content: `A child says: "${symptomDescription}". Provide helpful health advice.`
              }
            ],
            max_tokens: 200,
            temperature: 0.7
          })
        })

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json()
          console.log('OpenAI response received')
          
          const aiText = openaiData.choices[0]?.message?.content || 'I understand your concern.'
          
          const response = NextResponse.json({
            severity: "moderate",
            recommendations: [
              "Rest and take it easy",
              "Drink plenty of water",
              "Tell an adult about your symptoms",
              "See a doctor if symptoms don't improve"
            ],
            explanation: aiText,
            doctorReasons: [
              "To get proper medical advice",
              "To rule out serious conditions",
              "To help you feel better faster"
            ],
            followUpQuestions: [
              "How are you feeling now?",
              "Have you told an adult about this?",
              "Do you have any other symptoms?"
            ],
            safetyNotes: "Remember, I'm here to help, but a real doctor can give you the best advice for your specific situation."
          })
          
          // Add CORS headers
          response.headers.set('Access-Control-Allow-Origin', '*')
          response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
          response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
          
          return response
        }
      }
    } catch (openaiError) {
      console.log('OpenAI API failed:', openaiError.message)
    }

    // Fallback to enhanced rule-based responses
    console.log('Using enhanced fallback response for:', symptomDescription.substring(0, 100))
    const response = NextResponse.json(getFallbackAdvice(symptomDescription, imageData))
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response

  } catch (error) {
    console.error('Error in symptom advice API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Fallback advice function (moved from client-api.ts)
function getFallbackAdvice(symptomDescription: string, imageData?: string): SymptomAdvice {
  const lowerCaseSymptom = symptomDescription.toLowerCase()
  
  // Enhanced fallback with image analysis hints
  if (imageData) {
    return {
      severity: "moderate",
      recommendations: [
        "Based on the image analysis, please consult with a healthcare provider for accurate diagnosis",
        "Keep the area clean and dry",
        "Monitor for any changes in symptoms",
        "Take note of any additional symptoms that develop"
      ],
      explanation: "I can see you've shared an image for analysis. While I can provide general guidance, visual symptoms often require professional medical evaluation for accurate diagnosis.",
      doctorReasons: [
        "Visual symptoms need professional evaluation",
        "The condition may require medical treatment",
        "To rule out serious underlying conditions",
        "For proper diagnosis and treatment plan"
      ],
      followUpQuestions: [
        "How long have you had these symptoms?",
        "Are the symptoms getting worse or better?",
        "Do you have any other symptoms?"
      ],
      safetyNotes: "Image analysis is for informational purposes only and should not replace professional medical advice."
    }
  }

  // Check for follow-up questions and provide more detailed responses
  if (lowerCaseSymptom.includes("what should i do") || lowerCaseSymptom.includes("how do i") || lowerCaseSymptom.includes("can you help")) {
    return {
      severity: "moderate",
      recommendations: [
        "First, take a deep breath and don't worry - most health problems get better with time",
        "Tell a trusted adult (parent, teacher, or family member) about how you're feeling",
        "Rest and take it easy - your body needs time to heal",
        "Drink plenty of water to stay hydrated",
        "Eat healthy foods like fruits and vegetables to help your body fight off illness"
      ],
      explanation: "It's completely normal to feel worried when you don't feel well. The most important thing is to let an adult know what's happening so they can help you get the care you need.",
      doctorReasons: [
        "To make sure you get the right treatment",
        "To check if there's something more serious going on",
        "To help you feel better faster",
        "To give you peace of mind"
      ],
      followUpQuestions: [
        "Have you told an adult about how you're feeling?",
        "Are you able to eat and drink normally?",
        "Do you have any other symptoms we should know about?"
      ],
      safetyNotes: "Remember, I'm here to help, but a real doctor can examine you and give you the best advice for your specific situation."
    }
  }

  // Emergency symptoms
  if (
    lowerCaseSymptom.includes("chest pain") ||
    lowerCaseSymptom.includes("can't breathe") ||
    lowerCaseSymptom.includes("unconscious") ||
    lowerCaseSymptom.includes("severe bleeding")
  ) {
    return {
      severity: "emergency",
      recommendations: [
        "Call emergency services (911) immediately or tell an adult right away",
        "Stay calm and follow emergency operator instructions",
        "Do not try to drive yourself anywhere - get help from an adult",
        "Keep the person still and comfortable until help arrives"
      ],
      explanation: "These symptoms are very serious and need immediate help from a doctor or emergency services. It's important to tell an adult right away.",
      doctorReasons: [
        "This is a life-threatening emergency",
        "Immediate medical intervention is required",
        "Professional assessment is critical"
      ],
      followUpQuestions: [
        "Are you still experiencing these symptoms?",
        "Have you called emergency services or told an adult?",
        "Is someone with you to help?"
      ],
      safetyNotes: "This is an emergency situation requiring immediate medical attention. Tell an adult right away!"
    }
  }

  // Headache symptoms
  if (lowerCaseSymptom.includes("headache") || lowerCaseSymptom.includes("head hurts")) {
    return {
      severity: "moderate",
      recommendations: [
        "Rest in a quiet, dark room",
        "Drink plenty of water",
        "Apply a cool cloth to your forehead",
        "Consider over-the-counter pain relief (consult your doctor)"
      ],
      explanation: "Headaches can be caused by dehydration, stress, eye strain, or other factors. Rest and hydration often help.",
      doctorReasons: [
        "Severe or persistent headache",
        "Headache with fever or stiff neck",
        "Headache after head injury",
        "Headache with vision changes"
      ],
      followUpQuestions: [
        "How long has the headache lasted?",
        "Is this the worst headache you've ever had?",
        "Do you have any other symptoms?"
      ],
      safetyNotes: "Seek immediate medical attention for severe headaches or those with concerning symptoms."
    }
  }

  // Stomach symptoms
  if (
    lowerCaseSymptom.includes("stomach") ||
    lowerCaseSymptom.includes("tummy") ||
    lowerCaseSymptom.includes("nausea")
  ) {
    return {
      severity: "moderate",
      recommendations: [
        "Sip clear fluids like water, broth, or sports drinks slowly",
        "Avoid solid foods until you feel better",
        "Rest and take it easy - no running around or playing hard",
        "Try bland foods like crackers or toast when you're ready to eat",
        "Tell a parent or adult if you feel really bad"
      ],
      explanation: "Stomach problems are common and usually get better with rest and drinking fluids. It's important to stay hydrated and eat simple foods.",
      doctorReasons: [
        "Severe or persistent tummy pain that won't go away",
        "Can't keep any fluids down (throwing up everything)",
        "Blood in vomit or when you go to the bathroom",
        "High fever with stomach symptoms",
        "Feeling very weak or dizzy"
      ],
      followUpQuestions: [
        "How long have you had these symptoms?",
        "Are you able to keep fluids down?",
        "Do you have a fever?",
        "Have you told a parent or adult about how you're feeling?"
      ],
      safetyNotes: "Dehydration can be serious, especially for kids and teens. Tell an adult if you can't keep fluids down or feel really bad."
    }
  }

  // Default response
  return {
    severity: "moderate",
    recommendations: [
      "Rest and take it easy - no rough play or sports",
      "Drink plenty of water and stay hydrated",
      "Watch how you're feeling and tell an adult if you feel worse",
      "Tell a parent or adult if symptoms don't get better"
    ],
    explanation: "Your symptoms might get better with rest and time. It's important to tell an adult how you're feeling and get help if you need it.",
    doctorReasons: [
      "Symptoms don't improve after 2-3 days",
      "Symptoms get worse or you feel much sicker",
      "You develop a high fever",
      "You feel really bad or worried about how you feel"
    ],
    followUpQuestions: [
      "How long have you had these symptoms?",
      "Are the symptoms getting better or worse?",
      "Do you have any other symptoms?",
      "Have you told a parent or adult about how you're feeling?"
    ],
    safetyNotes: "When in doubt, tell an adult and ask them to help you see a doctor or healthcare provider."
  }
}
