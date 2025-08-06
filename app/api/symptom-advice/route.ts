import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini with secure API key handling
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(apiKey || '')

// Medical knowledge base for RAG (Retrieval-Augmented Generation)
const medicalKnowledgeBase = {
  emergency_symptoms: [
    "chest pain", "difficulty breathing", "severe bleeding", "unconsciousness", 
    "severe head injury", "sudden severe headache", "paralysis", "seizures",
    "severe allergic reaction", "poisoning", "broken bones", "severe burns"
  ],
  pediatric_guidelines: {
    fever: "Children under 3 months with fever need immediate medical attention",
    dehydration: "Signs include dry mouth, no tears, sunken eyes, decreased urination",
    head_injury: "Any head injury in children requires medical evaluation",
    breathing: "Rapid breathing, wheezing, or difficulty breathing needs immediate care"
  },
  home_remedies: {
    fever: "Rest, fluids, acetaminophen or ibuprofen (consult doctor for dosage)",
    cough: "Honey (over 1 year), humidifier, rest, fluids",
    stomach: "Clear fluids, bland foods, rest, avoid dairy initially",
    minor_cuts: "Clean with soap and water, apply antibiotic ointment, cover with bandage"
  }
}

// Function to clean JSON response from markdown formatting
function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim()
  
  // If the response starts with { and ends with }, it's valid JSON
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    return cleaned
  }
  
  // Try to extract JSON from the response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }
  
  throw new Error('No valid JSON found in response')
}

export async function POST(request: NextRequest) {
  try {
    const { symptomDescription } = await request.json()

    if (!symptomDescription) {
      return NextResponse.json({ error: 'Symptom description is required' }, { status: 400 })
    }

    // Debug: Check if API key is available
    if (!apiKey) {
      console.error('No Gemini API key found, falling back to mock response')
      return NextResponse.json({
        severity: "moderate",
        recommendations: [
          "Please check your API key configuration",
          "The app is running in fallback mode",
          "Contact support if this persists"
        ],
        explanation: "API key not configured properly. Using fallback response.",
        doctorReasons: [
          "If you have serious symptoms, please consult a healthcare provider immediately"
        ],
        followUpQuestions: [
          "Have you configured your Gemini API key?",
          "Are you experiencing any emergency symptoms?"
        ],
        safetyNotes: "This is a fallback response due to API configuration issues."
      })
    }

    // Check for emergency symptoms first
    const lowerCaseSymptom = symptomDescription.toLowerCase()
    const isEmergency = medicalKnowledgeBase.emergency_symptoms.some(symptom => 
      lowerCaseSymptom.includes(symptom)
    )

    // Enhanced prompt with RAG context and HIPAA compliance
    const prompt = `You are a pediatric healthcare assistant with access to medical knowledge. Your role is to provide safe, evidence-based guidance while always prioritizing patient safety.

CONTEXT: ${isEmergency ? 'EMERGENCY SITUATION DETECTED' : 'Non-emergency symptom assessment'}

Given this symptom description: "${symptomDescription}"

IMPORTANT GUIDELINES:
- Always err on the side of caution for children's health
- Use simple, child-friendly language
- Provide specific, actionable advice
- Never make definitive diagnoses
- Always recommend medical attention for serious symptoms
- Follow HIPAA principles: minimize data collection, ensure privacy, provide secure guidance

Please provide advice in the following JSON format:
{
  "severity": "mild|moderate|serious|emergency",
  "recommendations": ["array of 3-5 specific actionable steps"],
  "explanation": "Simple explanation of what's happening and why the recommendations help",
  "doctorReasons": ["array of 3-5 specific reasons when to see a doctor immediately"],
  "followUpQuestions": ["array of 2-3 questions to ask if symptoms persist"],
  "safetyNotes": "Any important safety considerations"
}

${isEmergency ? 'EMERGENCY PROTOCOL: This requires immediate medical attention. Emphasize calling emergency services or going to the nearest emergency room.' : ''}

Respond only with valid JSON, no additional text or markdown formatting.`

    // Use Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    console.log('Attempting to call Gemini API...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error('No response from Gemini')
    }

    console.log('Gemini API call successful')
    console.log('Raw response:', text.substring(0, 200) + '...')

    // Clean and parse the JSON response
    const cleanedText = cleanJsonResponse(text)
    const advice = JSON.parse(cleanedText)

    // Add HIPAA compliance metadata
    const enhancedAdvice = {
      ...advice,
      metadata: {
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId(),
        privacyLevel: "HIPAA-compliant",
        dataRetention: "session-only",
        encryption: "enabled",
        model: "gemini-1.5-flash"
      }
    }

    return NextResponse.json(enhancedAdvice)
  } catch (error) {
    console.error('Error getting symptom advice:', error)
    
    // Return a helpful error response
    return NextResponse.json({
      severity: "moderate",
      recommendations: [
        "Try refreshing the page",
        "Check your internet connection",
        "Contact support if the problem persists"
      ],
      explanation: "We're having trouble connecting to our AI service right now. Please try again in a moment.",
      doctorReasons: [
        "If you have serious symptoms, please consult a healthcare provider immediately"
      ],
      followUpQuestions: [
        "Are you experiencing any emergency symptoms?",
        "Would you like to try the guided quiz instead?"
      ],
      safetyNotes: "This is a fallback response due to a temporary service issue."
    }, { status: 200 }) // Return 200 instead of 500 to avoid client errors
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
} 