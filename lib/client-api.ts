import type { SymptomAdvice } from "./types"

// Client-side API service
export async function getSymptomAdviceClient(symptomDescription: string, imageData?: string): Promise<SymptomAdvice> {
  try {
    console.log('🔄 Getting AI advice for symptom:', symptomDescription.substring(0, 50) + '...')
    
    // Try Google Gemini API directly from client (works on GitHub Pages)
    try {
      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      console.log('🔑 Gemini API Key check:', {
        exists: !!geminiKey,
        length: geminiKey?.length || 0,
        startsWith: geminiKey?.substring(0, 10) || 'N/A',
        fullKey: geminiKey ? geminiKey.substring(0, 15) + '...' : 'NOT FOUND'
      })
      
      if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
        console.error('❌ Gemini API key not configured!')
        console.error('⚠️ Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env file and RESTART the dev server (stop and start npm run dev)')
        throw new Error('Gemini API key not configured')
      }
      
      if (geminiKey) {
        console.log('🤖 Trying Google Gemini API...')
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

        console.log('📡 Gemini API Response Status:', geminiResponse.status, geminiResponse.statusText)
        
        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.json().catch(() => ({ error: 'Unknown error' }))
          console.error('❌ Gemini API error:', geminiResponse.status, geminiResponse.statusText)
          console.error('Error details:', errorData)
          
          // Handle specific error cases
          if (geminiResponse.status === 429) {
            const errorMessage = errorData?.error?.message || 'Rate limit exceeded'
            console.error('🚫 QUOTA EXCEEDED: Your Gemini API key has no quota or has exceeded the rate limit.')
            console.error('💡 Solution: Check your Google Cloud Console to enable the API and set up billing/quota.')
            console.error('📖 Help: https://cloud.google.com/docs/quotas/help/request_increase')
            throw new Error(`Gemini API quota exceeded: ${errorMessage}`)
          }
          
          throw new Error(`Gemini API error: ${geminiResponse.status} - ${JSON.stringify(errorData)}`)
        }

        const geminiData = await geminiResponse.json()
        console.log('✅ Google Gemini response received')
        console.log('📦 Response data:', geminiData)
        
        const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand your concern.'
        console.log('📝 Extracted AI text:', aiText.substring(0, 100) + '...')
        
        if (!aiText || aiText === 'I understand your concern.') {
          console.warn('⚠️ Gemini API returned empty or default text')
          console.warn('Full response:', JSON.stringify(geminiData, null, 2))
        }
        
        return {
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
          }
      }
    } catch (geminiError) {
      console.log('❌ Google Gemini API failed:', geminiError instanceof Error ? geminiError.message : String(geminiError))
    }

    // Try OpenAI API directly from client (works on GitHub Pages)
    try {
      const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (openaiKey) {
        console.log('🤖 Trying OpenAI API...')
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

        console.log('📡 OpenAI API Response Status:', openaiResponse.status, openaiResponse.statusText)
        
        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json().catch(() => ({ error: 'Unknown error' }))
          console.error('❌ OpenAI API error:', openaiResponse.status, openaiResponse.statusText)
          console.error('Error details:', errorData)
          
          if (openaiResponse.status === 401) {
            console.error('🔐 UNAUTHORIZED: Your OpenAI API key is invalid or missing.')
            console.error('💡 Solution: Check your .env file and make sure NEXT_PUBLIC_OPENAI_API_KEY is set correctly.')
            throw new Error('OpenAI API key is invalid or unauthorized')
          }
          
          throw new Error(`OpenAI API error: ${openaiResponse.status} - ${JSON.stringify(errorData)}`)
        }

        const openaiData = await openaiResponse.json()
        console.log('✅ OpenAI response received')
        
        const aiText = openaiData.choices[0]?.message?.content || 'I understand your concern.'
        
        return {
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
        }
      }
    } catch (openaiError) {
      console.log('❌ OpenAI API failed:', openaiError instanceof Error ? openaiError.message : String(openaiError))
    }

    // Fallback to enhanced rule-based responses
    console.log('🔄 Using enhanced fallback responses')
    return getFallbackAdvice(symptomDescription, imageData)
    
  } catch (error) {
    console.error('❌ Error getting symptom advice:', error)
    console.log('🔄 Falling back to rule-based responses')
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

  // Check for specific follow-up questions
  if (lowerCaseSymptom.includes("is it serious") || lowerCaseSymptom.includes("should i worry")) {
    return {
      severity: "moderate",
      recommendations: [
        "Try not to worry too much - most health problems are not serious",
        "The best way to know for sure is to talk to a doctor",
        "Keep track of your symptoms and how you're feeling",
        "Tell an adult if you're feeling scared or worried"
      ],
      explanation: "It's totally normal to worry when you don't feel well! The good news is that most health problems kids have are not serious and get better with time. A doctor can help you understand what's happening and make sure you get better.",
      doctorReasons: [
        "To help you feel less worried",
        "To make sure everything is okay",
        "To give you the right treatment if needed",
        "To answer all your questions"
      ],
      followUpQuestions: [
        "What's making you feel most worried?",
        "Have you talked to an adult about your concerns?",
        "Is there anything specific that's bothering you?"
      ],
      safetyNotes: "Remember, it's always better to ask questions and get help from a real doctor than to worry alone. Doctors are here to help you feel better!"
    }
  }

  if (lowerCaseSymptom.includes("how long") || lowerCaseSymptom.includes("when will i feel better")) {
    return {
      severity: "moderate",
      recommendations: [
        "Most minor illnesses get better in 3-7 days",
        "Rest and sleep help your body heal faster",
        "Eat healthy foods and drink lots of water",
        "Be patient - healing takes time"
      ],
      explanation: "Everyone heals at different speeds, but most common illnesses like colds and minor injuries get better within a week. The important thing is to take care of yourself and let your body do its healing work.",
      doctorReasons: [
        "If symptoms last longer than expected",
        "If you're not getting better after a week",
        "If symptoms get worse instead of better",
        "If you're worried about how long it's taking"
      ],
      followUpQuestions: [
        "How long have you been feeling this way?",
        "Are you getting any better at all?",
        "What have you tried to help yourself feel better?"
      ],
      safetyNotes: "If you're not getting better or if you're worried about how long it's taking, it's a good idea to see a doctor who can help you understand what's happening."
    }
  }

  if (lowerCaseSymptom.includes("can i go to school") || lowerCaseSymptom.includes("should i stay home")) {
    return {
      severity: "moderate",
      recommendations: [
        "If you have a fever, it's best to stay home and rest",
        "If you're coughing a lot, you might want to stay home so you don't spread germs",
        "If you feel too tired or sick to focus, rest is better than school",
        "Ask your parents or teachers what they think is best"
      ],
      explanation: "When you're sick, your body needs extra energy to fight off the illness. Sometimes staying home and resting helps you get better faster than trying to push through and go to school.",
      doctorReasons: [
        "To help you get better faster",
        "To prevent spreading illness to others",
        "To make sure you're not making yourself sicker",
        "To give you the rest your body needs"
      ],
      followUpQuestions: [
        "How are you feeling right now?",
        "Do you have a fever?",
        "Are you able to eat and drink normally?"
      ],
      safetyNotes: "Your parents and teachers know you best and can help you decide what's right for your situation. When in doubt, it's better to rest and get better than to push yourself too hard."
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