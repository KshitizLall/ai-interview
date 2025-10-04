"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Briefcase, Sparkles, Upload, CheckCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface QuestionGenerationAnimationProps {
  show: boolean
  mode?: 'resume' | 'jd' | 'combined'
  questionCount?: number
  progress?: number
  onComplete?: () => void
}

export function QuestionGenerationAnimation({ 
  show, 
  mode = 'combined',
  questionCount = 10,
  progress = 0,
  onComplete
}: QuestionGenerationAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState<'analyzing' | 'generating' | 'finalizing' | 'complete'>('analyzing')
  const [generatedQuestions, setGeneratedQuestions] = useState(0)

  useEffect(() => {
    if (show) {
      const phases = [
        { phase: 'analyzing' as const, duration: 1000 },
        { phase: 'generating' as const, duration: 2500 },
        { phase: 'finalizing' as const, duration: 800 },
        { phase: 'complete' as const, duration: 500 }
      ]

      let totalDelay = 0
      const timers = phases.map(({ phase, duration }) => {
        const timer = setTimeout(() => setCurrentPhase(phase), totalDelay)
        totalDelay += duration
        return timer
      })

      // Simulate question generation progress
      const questionTimer = setInterval(() => {
        setGeneratedQuestions(prev => {
          if (prev < questionCount) {
            return prev + 1
          }
          clearInterval(questionTimer)
          return prev
        })
      }, 200)

      // Auto-complete
      const completeTimer = setTimeout(() => onComplete?.(), totalDelay)

      return () => {
        timers.forEach(clearTimeout)
        clearTimeout(completeTimer)
        clearInterval(questionTimer)
      }
    }
  }, [show, questionCount, onComplete])

  const getModeConfig = () => {
    switch (mode) {
      case 'resume':
        return {
          icon: FileText,
          title: 'From Resume',
          description: 'Analyzing your experience and skills',
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'from-blue-500/20 to-cyan-500/20'
        }
      case 'jd':
        return {
          icon: Briefcase,
          title: 'From Job Description',
          description: 'Understanding role requirements',
          color: 'from-emerald-500 to-teal-500',
          bgColor: 'from-emerald-500/20 to-teal-500/20'
        }
      case 'combined':
        return {
          icon: Sparkles,
          title: 'Combined Analysis',
          description: 'Matching your profile to the role',
          color: 'from-purple-500 to-indigo-500',
          bgColor: 'from-purple-500/20 to-indigo-500/20'
        }
    }
  }

  const getPhaseConfig = () => {
    switch (currentPhase) {
      case 'analyzing':
        return {
          title: 'Analyzing Content',
          description: 'Understanding your background and requirements...',
          icon: Upload
        }
      case 'generating':
        return {
          title: 'Generating Questions',
          description: `Creating ${questionCount} personalized questions...`,
          icon: Sparkles
        }
      case 'finalizing':
        return {
          title: 'Finalizing',
          description: 'Reviewing and optimizing questions...',
          icon: Loader2
        }
      case 'complete':
        return {
          title: 'Complete!',
          description: `${questionCount} questions generated successfully`,
          icon: CheckCircle
        }
    }
  }

  const modeConfig = getModeConfig()
  const phaseConfig = getPhaseConfig()

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
            {/* Animated background */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${modeConfig.bgColor}`}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Floating elements based on mode */}
            {mode === 'combined' && Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${15 + (i % 3) * 25}%`,
                  top: `${20 + Math.floor(i / 3) * 25}%`
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity
                }}
              >
                {i % 2 === 0 ? (
                  <FileText className="w-4 h-4 text-blue-400" />
                ) : (
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                )}
              </motion.div>
            ))}

            <div className="relative z-10 text-center space-y-6">
              {/* Mode indicator */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`mx-auto w-16 h-16 bg-gradient-to-r ${modeConfig.color} rounded-full flex items-center justify-center shadow-lg`}
              >
                <modeConfig.icon className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {modeConfig.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {modeConfig.description}
                </p>
              </motion.div>

              {/* Current phase */}
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={currentPhase === 'finalizing' ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <phaseConfig.icon className={`w-5 h-5 ${
                      currentPhase === 'complete' ? 'text-green-500' : 'text-purple-500'
                    }`} />
                  </motion.div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {phaseConfig.title}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {phaseConfig.description}
                </p>

                {/* Question counter */}
                {currentPhase === 'generating' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-purple-600">
                      {generatedQuestions}/{questionCount}
                    </div>
                    <div className="text-xs text-gray-500">questions generated</div>
                  </motion.div>
                )}
              </motion.div>

              {/* Progress bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Progress</span>
                  <span>{Math.round((generatedQuestions / questionCount) * 100)}%</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${modeConfig.color}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${(generatedQuestions / questionCount) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>

              {/* Phase indicators */}
              <div className="flex justify-center space-x-2">
                {['analyzing', 'generating', 'finalizing', 'complete'].map((phase, index) => (
                  <motion.div
                    key={phase}
                    className={`w-2 h-2 rounded-full ${
                      ['analyzing', 'generating', 'finalizing', 'complete'].indexOf(currentPhase) >= index
                        ? modeConfig.color.includes('purple') ? 'bg-purple-500' : 
                          modeConfig.color.includes('blue') ? 'bg-blue-500' : 'bg-emerald-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    animate={
                      ['analyzing', 'generating', 'finalizing', 'complete'].indexOf(currentPhase) === index
                        ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }
                        : {}
                    }
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}