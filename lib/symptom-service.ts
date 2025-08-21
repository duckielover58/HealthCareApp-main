import type { SymptomAdvice } from "./types"
import { getSymptomAdviceClient } from "./client-api"

export async function getSymptomAdvice(symptomDescription: string, imageData?: string): Promise<SymptomAdvice> {
  return getSymptomAdviceClient(symptomDescription, imageData)
}
