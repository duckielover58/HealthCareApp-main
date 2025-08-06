import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Disclaimer() {
  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="w-4 h-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <strong>Important:</strong> This app provides general health information only and is not a substitute for professional medical advice. 
        Always consult with a parent, guardian, or healthcare provider for proper diagnosis and treatment.
      </AlertDescription>
    </Alert>
  )
} 