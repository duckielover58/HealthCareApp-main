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
        "Call emergency services (911) immediately",
        "Stay calm and follow emergency operator instructions",
        "Do not attempt to drive yourself to the hospital",
        "Keep the person still and comfortable"
      ],
      explanation: "These symptoms indicate a medical emergency that requires immediate professional attention.",
      doctorReasons: [
        "This is a life-threatening emergency",
        "Immediate medical intervention is required",
        "Professional assessment is critical"
      ],
      followUpQuestions: [
        "Are you still experiencing these symptoms?",
        "Have you called emergency services?",
        "Is someone with you to help?"
      ],
      safetyNotes: "This is an emergency situation requiring immediate medical attention."
    }
  }

  if (lowerCaseSymptom.includes("headache") || lowerCaseSymptom.includes("head hurts")) {
    return {
      severity: "moderate",
      recommendations: [
        "Rest in a quiet, dark room",
        "Drink plenty of water",
        "Apply a cool cloth to your forehead",
        "Consider over-the-counter pain relief (consult doctor for children)"
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
        "Sip clear fluids like water or broth",
        "Avoid solid foods until symptoms improve",
        "Rest and avoid strenuous activity",
        "Try bland foods like crackers when ready to eat"
      ],
      explanation: "Stomach issues often resolve with rest, hydration, and a bland diet. Avoid dairy and fatty foods initially.",
      doctorReasons: [
        "Severe or persistent abdominal pain",
        "Inability to keep fluids down",
        "Blood in vomit or stool",
        "High fever with stomach symptoms"
      ],
      followUpQuestions: [
        "How long have you had these symptoms?",
        "Are you able to keep fluids down?",
        "Do you have a fever?"
      ],
      safetyNotes: "Dehydration can be serious, especially in children. Seek medical attention if unable to keep fluids down."
    }
  }

  // Default response
  return {
    severity: "moderate",
    recommendations: [
      "Rest and take it easy",
      "Stay hydrated with water",
      "Monitor your symptoms",
      "Contact a healthcare provider if symptoms worsen"
    ],
    explanation: "Your symptoms may resolve with rest and time. Monitor for any changes and seek medical attention if needed.",
    doctorReasons: [
      "Symptoms don't improve after 2-3 days",
      "Symptoms get worse",
      "You develop a high fever",
      "You feel much sicker than before"
    ],
    followUpQuestions: [
      "How long have you had these symptoms?",
      "Are the symptoms getting better or worse?",
      "Do you have any other symptoms?"
    ],
    safetyNotes: "When in doubt, consult with a healthcare provider for proper evaluation and treatment."
  }
} 