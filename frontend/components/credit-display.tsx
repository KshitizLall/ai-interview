"use client"

import { useAuth } from '@/components/auth-provider'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AuthModal } from '@/components/auth-modal'
import { Coins, Lock, Zap, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface CreditDisplayProps {
  showUpgradeButton?: boolean
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
}

export function CreditDisplay({ 
  showUpgradeButton = false, 
  size = 'md',
  showProgress = true
}: CreditDisplayProps) {
  const { user, isAuthenticated, anonymousUsage, getRemainingQuota } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (isAuthenticated && user) {
    // Authenticated user display
    const creditColor = user.credits > 20 ? 'text-green-600' : user.credits > 5 ? 'text-yellow-600' : 'text-red-600'
    const creditBg = user.credits > 20 ? 'bg-green-50' : user.credits > 5 ? 'bg-yellow-50' : 'bg-red-50'

    return (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${creditBg} border`}>
              <Coins className={`w-4 h-4 ${creditColor}`} />
              <span className={`font-medium ${creditColor} ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
                {user.credits}
              </span>
              <span className="text-muted-foreground text-sm">credits</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>You have {user.credits} credits remaining</p>
            <p className="text-xs text-muted-foreground">
              Each question or answer generation costs 1 credit
            </p>
          </TooltipContent>
        </Tooltip>

        {user.credits <= 5 && showUpgradeButton && (
          <Button size="sm" variant="outline" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Get More Credits
          </Button>
        )}
      </div>
    )
  }

  // Anonymous user display
  const questionsRemaining = getRemainingQuota('questions')
  const totalQuestions = anonymousUsage.max_questions
  const progressPercentage = ((totalQuestions - questionsRemaining) / totalQuestions) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-orange-500" />
          <span className={`font-medium ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
            Free: {questionsRemaining}/{totalQuestions}
          </span>
          <Badge variant="secondary" className="text-xs">
            Questions left
          </Badge>
        </div>
      </div>

      {showProgress && (
        <div className="space-y-1">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {questionsRemaining > 0 
              ? `${questionsRemaining} free questions remaining`
              : 'Free limit reached'
            }
          </p>
        </div>
      )}

      {showUpgradeButton && (
        <div className="mt-3">
          <Button 
            size="sm" 
            onClick={() => setShowAuthModal(true)}
            className="w-full"
          >
            <Zap className="w-4 h-4 mr-2" />
            Login for 50 Free Credits
          </Button>
        </div>
      )}

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab="signup"
      />
    </div>
  )
}

// Compact version for headers
export function CreditDisplayCompact() {
  const { user, isAuthenticated, anonymousUsage, getRemainingQuota } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (isAuthenticated && user) {
    const creditColor = user.credits > 20 ? 'text-green-600' : user.credits > 5 ? 'text-yellow-600' : 'text-red-600'

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30">
            <Coins className={`w-3.5 h-3.5 ${creditColor}`} />
            <span className={`text-sm font-medium ${creditColor}`}>
              {user.credits}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{user.credits} credits remaining</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  const questionsRemaining = getRemainingQuota('questions')
  const showWarning = questionsRemaining <= 2

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
            showWarning ? 'bg-orange-50 border border-orange-200' : 'bg-muted/30'
          }`}>
            <Lock className={`w-3.5 h-3.5 ${showWarning ? 'text-orange-500' : 'text-muted-foreground'}`} />
            <span className={`text-sm font-medium ${showWarning ? 'text-orange-700' : 'text-foreground'}`}>
              {questionsRemaining}/10
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{questionsRemaining} free questions remaining</p>
          <p className="text-xs text-muted-foreground">Login to get 50 more credits</p>
        </TooltipContent>
      </Tooltip>

      {questionsRemaining <= 2 && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowAuthModal(true)}
          className="text-xs h-7 px-2"
        >
          Get More
        </Button>
      )}

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab="signup"
      />
    </div>
  )
}