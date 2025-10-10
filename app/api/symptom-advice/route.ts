import { NextRequest, NextResponse } from 'next/server'
import type { SymptomAdvice } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { symptomDescription, imageData } = await request.json()
    
    if (!symptomDescription) {
      return NextResponse.json({ error: 'Symptom description is required' }, { status: 400 })
    }

    // Use OpenAI API for real AI responses
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!openaiApiKey) {
      // Fallback to rule-based responses if no API key
      return NextResponse.json(getFallbackAdvice(symptomDescription, imageData))
    }

    // Create a prompt for OpenAI
    const prompt = `You are a helpful AI health assistant for children and teens (ages 8-15). Provide health guidance based on the symptom description. Be reassuring, use simple language, and always encourage consulting with a real doctor.

Symptom description: ${symptomDescription}
${imageData ? 'Note: User has also provided an image for analysis.' : ''}

Please respond with a JSON object in this exact format:
{
  "severity": "mild" | "moderate" | "serious" | "emergency",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "explanation": "Simple explanation of what this might be",
  "doctorReasons": ["reason1", "reason2", "reason3"],
  "followUpQuestions": ["question1", "question2", "question3"],
  "safetyNotes": "Important safety information if needed"
}

Guidelines:
- Use age-appropriate language
- Be reassuring and not scary
- Always include reasons to see a doctor
- Focus on general guidance, not diagnosis
- Keep recommendations practical and simple
- Emphasize telling adults about concerns`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI health assistant for children and teens. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    try {
      // Parse the JSON response from AI
      const advice: SymptomAdvice = JSON.parse(aiResponse)
      
      // Validate the response structure
      if (!advice.severity || !advice.recommendations || !advice.explanation) {
        throw new Error('Invalid response structure from AI')
      }

      return NextResponse.json(advice)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      // Fallback to rule-based response if AI response is malformed
      return NextResponse.json(getFallbackAdvice(symptomDescription, imageData))
    }

  } catch (error) {
    console.error('Error in symptom advice API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
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
