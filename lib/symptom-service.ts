import type { SymptomAdvice } from "./types"

export async function getSymptomAdvice(symptomDescription: string, imageData?: string): Promise<SymptomAdvice> {
  try {
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

    if (!response.ok) {
      throw new Error('Failed to get advice from API')
    }

    const advice = await response.json()
    return advice
  } catch (error) {
    console.error('Error getting symptom advice:', error)
    
    // Fallback to mock implementation if API fails
    return getMockAdvice(symptomDescription)
  }
}

// Fallback mock implementation
function getMockAdvice(symptomDescription: string): SymptomAdvice {
  const lowerCaseSymptom = symptomDescription.toLowerCase()

  if (
    lowerCaseSymptom.includes("chest pain") ||
    lowerCaseSymptom.includes("can't breathe") ||
    lowerCaseSymptom.includes("unconscious") ||
    lowerCaseSymptom.includes("severe bleeding")
  ) {
    return {
      severity: "emergency",
      recommendations: [
        "Tell an adult immediately",
        "Call emergency services (911)",
        "Stay calm and follow emergency operator instructions",
      ],
      explanation:
        "These symptoms could be signs of a serious medical emergency that needs immediate professional help.",
      doctorReasons: [
        "This is an emergency situation",
        "You need immediate medical attention",
        "Do not wait - get help now",
      ],
    }
  }

  if (lowerCaseSymptom.includes("cut") || lowerCaseSymptom.includes("scrape") || lowerCaseSymptom.includes("fell")) {
    return {
      severity: "mild",
      recommendations: [
        "Clean the wound with soap and water for at least 30 seconds",
        "Apply gentle pressure with a clean cloth if it's bleeding",
        "Put on an adhesive bandage or sterile gauze",
        "Keep the wound clean and dry",
        "Change the bandage daily or if it gets wet or dirty",
      ],
      explanation: "Cleaning prevents infection by removing dirt and germs. Covering the wound helps it heal faster by keeping it clean and protected.",
      doctorReasons: [
        "The cut is deep (you can see fat, muscle, or bone)",
        "The bleeding won't stop after 10 minutes of pressure",
        "The area becomes very red, warm, swollen, or painful",
        "You see pus or red streaks coming from the wound",
        "You haven't had a tetanus shot in the last 5 years",
        "The cut was caused by something dirty or rusty",
      ],
    }
  }

  if (lowerCaseSymptom.includes("headache") || lowerCaseSymptom.includes("head hurts")) {
    return {
      severity: "moderate",
      recommendations: [
        "Rest in a quiet, dark room",
        "Drink water - being dehydrated can cause headaches",
        "Put a cool cloth on your forehead",
        "Ask an adult if you can take pain medicine",
      ],
      explanation:
        "Headaches can be caused by dehydration, stress, or eye strain. Rest and water often help them go away.",
      doctorReasons: [
        "The headache is very severe - the worst you've ever had",
        "You also have a stiff neck, fever, or vomiting",
        "The headache started after a head injury",
        "Your vision is blurry or you're confused",
      ],
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
        "Sip clear fluids like water or diluted sports drinks",
        "Avoid solid foods until you feel better",
        "Try eating plain crackers or toast when you're hungry",
        "Rest and avoid physical activity",
      ],
      explanation:
        "When your stomach is upset, eating bland foods and staying hydrated helps your body recover without making symptoms worse.",
      doctorReasons: [
        "You can't keep any fluids down for more than 12 hours",
        "You have severe pain in one specific area of your belly",
        "Your vomit is green or has blood in it",
        "You also have a high fever",
      ],
    }
  }

  // Default response for other symptoms
  return {
    severity: "moderate",
    recommendations: [
      "Rest and take it easy",
      "Drink plenty of water",
      "Tell a parent or guardian about how you're feeling",
      "Monitor your symptoms to see if they get better or worse",
    ],
    explanation: "Rest helps your body heal naturally, and staying hydrated is important for overall health.",
    doctorReasons: [
      "Your symptoms don't improve after 2-3 days",
      "Your symptoms get worse",
      "You develop a high fever",
      "You feel much sicker than before",
    ],
  }
}
