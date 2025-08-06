export interface SymptomAdvice {
  severity: "mild" | "moderate" | "serious" | "emergency"
  recommendations: string[]
  explanation: string
  doctorReasons: string[]
  followUpQuestions?: string[]
  safetyNotes?: string
  metadata?: {
    timestamp: string
    sessionId: string
    privacyLevel: string
    dataRetention: string
    encryption: string
  }
}
