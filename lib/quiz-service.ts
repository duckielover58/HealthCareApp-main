interface NextQuestionsResponse {
  questions: Array<{
    id: string
    question: string
    options: string[]
    category: string
  }>
}

export async function getNextQuestions(answers: Record<string, string>): Promise<NextQuestionsResponse> {
  // Client-side fallback for static hosting
  return getRuleBasedNextQuestions(answers)
}

function getRuleBasedNextQuestions(answers: Record<string, string>): NextQuestionsResponse {
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
  
  if (symptom === 'cough' || symptom === 'cold') {
    return {
      questions: [
        {
          id: 'cough-type',
          question: 'What type of cough do you have?',
          options: ['Dry cough', 'Wet cough with mucus', 'Barking cough', 'Cough with wheezing'],
          category: 'type'
        },
        {
          id: 'duration',
          question: 'How long have you been coughing?',
          options: ['Less than 1 week', '1-2 weeks', '2-4 weeks', 'More than 4 weeks'],
          category: 'duration'
        }
      ]
    }
  }
  
  if (symptom === 'stomach' || symptom === 'nausea') {
    return {
      questions: [
        {
          id: 'stomach-type',
          question: 'What stomach symptoms do you have?',
          options: ['Nausea', 'Vomiting', 'Diarrhea', 'Stomach pain', 'Loss of appetite'],
          category: 'type'
        },
        {
          id: 'duration',
          question: 'How long have you had these symptoms?',
          options: ['Less than 24 hours', '1-2 days', '3-5 days', 'More than 5 days'],
          category: 'duration'
        }
      ]
    }
  }
  
  // Default questions for other symptoms
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


