"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CreditConsumptionAnimation, 
  CreditRefillAnimation,
  AnswerGenerationAnimation,
  QuestionGenerationAnimation,
  InlineAnswerLoadingAnimation 
} from '@/components/animations'

export default function AnimationsTestPage() {
  const [showCreditConsumption, setShowCreditConsumption] = useState(false)
  const [showCreditRefill, setShowCreditRefill] = useState(false)
  const [showAnswerGeneration, setShowAnswerGeneration] = useState(false)
  const [showQuestionGeneration, setShowQuestionGeneration] = useState(false)

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Animation Showcase</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credit Animations */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Animations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowCreditConsumption(true)}
              className="w-full"
            >
              Show Credit Consumption (5 credits)
            </Button>
            
            <Button 
              onClick={() => setShowCreditRefill(true)}
              variant="outline"
              className="w-full"
            >
              Show Credit Refill (50 credits)
            </Button>
          </CardContent>
        </Card>

        {/* Answer Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Answer Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowAnswerGeneration(true)}
              className="w-full"
            >
              Show Answer Generation
            </Button>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Inline Loading:</h4>
              <InlineAnswerLoadingAnimation />
            </div>
          </CardContent>
        </Card>

        {/* Question Generation */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Question Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => setShowQuestionGeneration(true)}
                variant="outline"
              >
                Resume Mode
              </Button>
              <Button 
                onClick={() => setShowQuestionGeneration(true)}
                variant="outline"
              >
                Job Description Mode
              </Button>
              <Button 
                onClick={() => setShowQuestionGeneration(true)}
              >
                Combined Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Animation Components */}
      <CreditConsumptionAnimation
        show={showCreditConsumption}
        creditsUsed={5}
        onComplete={() => setShowCreditConsumption(false)}
      />

      <CreditRefillAnimation
        show={showCreditRefill}
        creditsAdded={50}
        onComplete={() => setShowCreditRefill(false)}
      />

      <AnswerGenerationAnimation
        show={showAnswerGeneration}
        question="Tell me about a time when you had to work under pressure to meet a tight deadline. How did you handle the situation and what was the outcome?"
        onComplete={() => setShowAnswerGeneration(false)}
      />

      <QuestionGenerationAnimation
        show={showQuestionGeneration}
        mode="combined"
        questionCount={10}
        onComplete={() => setShowQuestionGeneration(false)}
      />
    </div>
  )
}