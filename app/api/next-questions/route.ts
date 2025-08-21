import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : undefined

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { answers } = body as { answers: Record<string, string> }

    // Fallback simple rules if no API key available
    if (!genAI) {
      return NextResponse.json(getRuleBasedNextQuestions(answers))
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `You are building a pediatric symptom checker quiz. Based on prior answers, propose the next 2-4 most relevant questions.
Return JSON with fields: questions: [{id, question, options: [..], category}].
Prior answers JSON: ${JSON.stringify(answers)}
Constraints:
- Do NOT ask for body location if the symptom is fever or generalized
- Tailor options to the chosen symptom
- Use simple, easy-to-understand wording
Respond with JSON only, no markdown.`

    const result = await model.generateContent(prompt)
    const text = (await result.response).text()
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    const data = JSON.parse(cleaned)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(getRuleBasedNextQuestions({}), { status: 200 })
  }
}

function getRuleBasedNextQuestions(answers: Record<string, string>) {
  const symptom = (answers['symptom-type'] || '').toLowerCase()
  if (symptom === 'fever') {
    return {
      questions: [
        {
          id: 'fever-severity',
          question: 'How high is the fever?',
          options: [
            'Low (99–100.4°F / 37.2–38°C)',
            'Moderate (100.4–102.2°F / 38–39°C)',
            'High (102.2–104°F / 39–40°C)',
            'Very High (>104°F / >40°C)'
          ],
          category: 'severity'
        },
        {
          id: 'duration',
          question: 'How long has the fever been present?',
          options: ['Less than 24 hours', '1–2 days', '3–4 days', '5+ days'],
          category: 'duration'
        },
        {
          id: 'additional',
          question: 'Any of these with the fever?',
          options: ['Stiff neck', 'Severe headache', 'Rash', 'Trouble breathing', 'None of these'],
          category: 'additional'
        }
      ]
    }
  }
  // default
  return {
    questions: [
      {
        id: 'location',
        question: 'Where on your body is the problem?',
        options: ['Head', 'Throat', 'Chest', 'Stomach', 'Arm/Hand', 'Leg/Foot', 'Back', 'All over'],
        category: 'location'
      },
      {
        id: 'severity',
        question: 'How bad is it?',
        options: [
          'Mild - annoying but manageable',
          'Moderate - uncomfortable',
          'Severe - very painful',
          "Emergency - can't function"
        ],
        category: 'severity'
      }
    ]
  }
}


