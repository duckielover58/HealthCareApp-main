export async function fetchNextQuestions(answers: Record<string, string>) {
  try {
    const res = await fetch('/api/next-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    })
    if (!res.ok) throw new Error('Failed')
    return await res.json()
  } catch {
    return { questions: [] }
  }
}


