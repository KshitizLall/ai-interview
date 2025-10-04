"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, MessageSquare, Loader2, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AnswerGenerationAnimationProps {
  show: boolean
  question?: string
  onComplete?: () => void
  stage?: 'thinking' | 'generating' | 'complete'
}

export function AnswerGenerationAnimation({ 
  show, 
  question,
  onComplete,
  stage = 'thinking'
}: AnswerGenerationAnimationProps) {
  const [currentStage, setCurrentStage] = useState<'thinking' | 'generating' | 'complete'>('thinking')
  const [dots, setDots] = useState<Array<{ id: number; delay: number }>>([])

  useEffect(() => {
    if (show) {
      // Generate thinking dots
      const thinkingDots = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        delay: i * 0.1
      }))
      setDots(thinkingDots)

      // Stage progression
      const timers = [
        setTimeout(() => setCurrentStage('thinking'), 100),
        setTimeout(() => setCurrentStage('generating'), 1500),
        setTimeout(() => setCurrentStage('complete'), 3000),
        setTimeout(() => onComplete?.(), 3500)
      ]

      return () => timers.forEach(clearTimeout)
    }
  }, [show, onComplete])

  useEffect(() => {
    if (stage) {
      setCurrentStage(stage)
    }
  }, [stage])

  const getStageConfig = () => {
    switch (currentStage) {
      case 'thinking':
        return {
          icon: Brain,
          title: 'Analyzing Question',
          description: 'Understanding context and requirements...',
          color: 'from-blue-500 to-purple-500',
          bgColor: 'from-blue-500/20 to-purple-500/20'
        }
      case 'generating':
        return {
          icon: Sparkles,
          title: 'Generating Answer',
          description: 'Crafting a personalized response...',
          color: 'from-purple-500 to-pink-500',
          bgColor: 'from-purple-500/20 to-pink-500/20'
        }
      case 'complete':
        return {
          icon: CheckCircle,
          title: 'Answer Ready!',
          description: 'Your personalized answer has been generated.',
          color: 'from-green-500 to-emerald-500',
          bgColor: 'from-green-500/20 to-emerald-500/20'
        }
    }
  }

  const config = getStageConfig()

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl max-w-lg mx-4 relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${config.bgColor}`}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Floating thinking dots for 'thinking' stage */}
            {currentStage === 'thinking' && dots.map((dot) => (
              <motion.div
                key={dot.id}
                className="absolute w-2 h-2 bg-blue-400 rounded-full"
                style={{
                  left: `${20 + (dot.id % 4) * 15}%`,
                  top: `${20 + Math.floor(dot.id / 4) * 15}%`
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: dot.delay,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            ))}

            {/* Sparkle particles for 'generating' stage */}
            {currentStage === 'generating' && (
              <>
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                  </motion.div>
                ))}
              </>
            )}

            <div className="relative z-10 text-center space-y-6">
              {/* Main icon with stage-specific animation */}
              <motion.div
                key={currentStage} // Force re-render on stage change
                initial={{ scale: 0, rotate: -90 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  ...(currentStage === 'thinking' && {
                    rotate: [0, 5, -5, 0]
                  }),
                  ...(currentStage === 'generating' && {
                    scale: [1, 1.1, 1]
                  })
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200,
                  ...(currentStage === 'thinking' && {
                    rotate: { duration: 2, repeat: Infinity }
                  }),
                  ...(currentStage === 'generating' && {
                    scale: { duration: 1, repeat: Infinity }
                  })
                }}
                className={`mx-auto w-20 h-20 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center shadow-lg`}
              >
                <config.icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Stage title and description */}
              <motion.div
                key={`${currentStage}-text`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {config.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                  {config.description}
                </p>
              </motion.div>

              {/* Question preview (truncated) */}
              {question && currentStage !== 'complete' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto"
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-left line-clamp-2">
                      {question.length > 100 ? `${question.substring(0, 100)}...` : question}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Progress indicator */}
              {currentStage !== 'complete' && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex justify-center space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          (currentStage === 'thinking' && i === 0) ||
                          (currentStage === 'generating' && i <= 1)
                            ? config.color.includes('blue') ? 'bg-blue-500' : 'bg-purple-500'
                            : 'bg-gray-300'
                        }`}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1,
                          delay: i * 0.2,
                          repeat: Infinity
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {currentStage === 'thinking' ? 'Processing...' : 'Writing...'}
                  </div>
                </motion.div>
              )}

              {/* Success message for complete stage */}
              {currentStage === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-green-600 font-medium"
                >
                  ✨ Answer generated successfully!
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Quick loading animation for inline answer generation
export function InlineAnswerLoadingAnimation() {
  return (
    <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
      >
        <Sparkles className="w-4 h-4 text-white" />
      </motion.div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            AI is crafting your answer
          </span>
          <motion.div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-purple-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.2,
                  repeat: Infinity
                }}
              />
            ))}
          </motion.div>
        </div>
        
        {/* Animated progress bars */}
        <div className="space-y-1">
          <motion.div
            className="h-1 bg-purple-300 dark:bg-purple-700 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="h-1 bg-pink-300 dark:bg-pink-700 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "80%" }}
            transition={{ duration: 2.5, delay: 0.5, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  )
}