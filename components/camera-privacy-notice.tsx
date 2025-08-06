"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Camera, Eye } from "lucide-react"

interface CameraPrivacyNoticeProps {
  onAccept: () => void
  onDecline: () => void
}

export default function CameraPrivacyNotice({ onAccept, onDecline }: CameraPrivacyNoticeProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <Card className="max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <CardTitle>Camera Access</CardTitle>
          </div>
          <CardDescription>
            We need camera access to analyze visual symptoms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Camera className="w-4 h-4 text-green-600 mt-0.5" />
              <span className="text-sm">Photos are analyzed by AI for symptom assessment</span>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-blue-600 mt-0.5" />
              <span className="text-sm">Images are not stored permanently</span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-purple-600 mt-0.5" />
              <span className="text-sm">Your privacy is protected with encryption</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Privacy Note:</strong> Images are processed securely and deleted after analysis. 
            We never store or share your photos.
          </div>

          <div className="flex gap-3">
            <Button onClick={onAccept} className="flex-1">
              Allow Camera Access
            </Button>
            <Button variant="outline" onClick={onDecline}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 