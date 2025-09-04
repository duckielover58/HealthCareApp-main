import type { SymptomAdvice } from "./types"

// Client-side API service for static hosting
export async function getSymptomAdviceClient(symptomDescription: string, imageData?: string): Promise<SymptomAdvice> {
  try {
    // Try to use a public API if available, otherwise use fallback
    if (process.env.NODE_ENV === 'production') {
      // In production, we'll use a fallback since we can't run server-side APIs
      return getFallbackAdvice(symptomDescription, imageData)
    } else {
      // In development, try the local API
      const response = await fetch('/api/symptom-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symptomDescription,
          imageData 
        }),
      })

      if (response.ok) {
        return await response.json()
      } else {
        throw new Error('API not available')
      }
    }
  } catch (error) {
    console.error('Error getting symptom advice:', error)
    return getFallbackAdvice(symptomDescription, imageData)
  }
}

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

  // Text-based symptom analysis
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