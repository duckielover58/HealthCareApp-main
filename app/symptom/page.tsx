"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowRight, Sparkles } from "lucide-react"
import Header from "@/components/header"
import Disclaimer from "@/components/disclaimer"
import { getSymptomAdvice } from "@/lib/symptom-service"

export default function SymptomPage() {
  const router = useRouter()
  const [inputMethod, setInputMethod] = useState<"text" | "guided">("text")
  const [symptomText, setSymptomText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [guidedSymptom, setGuidedSymptom] = useState("")
  const [guidedLocation, setGuidedLocation] = useState("")
  const [guidedSeverity, setGuidedSeverity] = useState("")

  const handleSubmit = async () => {
    setIsLoading(true)

    let symptomDescription = symptomText

    if (inputMethod === "guided") {
      symptomDescription = `I have a ${guidedSymptom} in my ${guidedLocation}. The pain level is ${guidedSeverity}.`
    }

    // In a real implementation, this would call the RAG system
    const advice = await getSymptomAdvice(symptomDescription)

    // Store in session storage for the results page
    sessionStorage.setItem("symptomInput", symptomDescription)
    sessionStorage.setItem("symptomAdvice", JSON.stringify(advice))

    setIsLoading(false)
    router.push("/results")
  }

  const isFormValid =
    inputMethod === "text" ? symptomText.trim().length > 5 : guidedSymptom && guidedLocation && guidedSeverity

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="container px-4 py-8 mx-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Tell us what's wrong</CardTitle>
            <CardDescription>
              Describe how you're feeling or what happened, and we'll help you figure out what to do.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <RadioGroup
                defaultValue="text"
                className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                onValueChange={(value) => setInputMethod(value as "text" | "guided")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text-input" />
                  <Label htmlFor="text-input">Describe in your own words</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guided" id="guided-input" />
                  <Label htmlFor="guided-input">Answer simple questions</Label>
                </div>
              </RadioGroup>
            </div>

            {inputMethod === "text" ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="Example: I fell off my bike and scraped my knee. It's bleeding a little bit."
                  className="min-h-[150px]"
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="symptom-type">What type of problem are you having?</Label>
                  <RadioGroup value={guidedSymptom} onValueChange={setGuidedSymptom} className="grid grid-cols-2 gap-2">
                    {["pain", "rash", "fever", "cough", "cut", "bruise", "upset stomach", "headache"].map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <RadioGroupItem value={symptom} id={`symptom-${symptom}`} />
                        <Label htmlFor={`symptom-${symptom}`}>
                          {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body-location">Where on your body?</Label>
                  <RadioGroup
                    value={guidedLocation}
                    onValueChange={setGuidedLocation}
                    className="grid grid-cols-2 gap-2"
                  >
                    {["head", "arm", "leg", "stomach", "chest", "back", "throat", "ear"].map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <RadioGroupItem value={location} id={`location-${location}`} />
                        <Label htmlFor={`location-${location}`}>
                          {location.charAt(0).toUpperCase() + location.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">How bad is it?</Label>
                  <RadioGroup
                    value={guidedSeverity}
                    onValueChange={setGuidedSeverity}
                    className="grid grid-cols-3 gap-2"
                  >
                    {["mild", "medium", "severe"].map((severity) => (
                      <div key={severity} className="flex items-center space-x-2">
                        <RadioGroupItem value={severity} id={`severity-${severity}`} />
                        <Label htmlFor={`severity-${severity}`}>
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={handleSubmit} disabled={!isFormValid || isLoading} className="w-full gap-2">
              {isLoading ? (
                <>
                  Processing <Sparkles className="w-5 h-5 animate-pulse" />
                </>
              ) : (
                <>
                  Get Advice <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
            <Disclaimer />
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
