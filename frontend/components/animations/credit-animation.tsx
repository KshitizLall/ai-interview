"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Zap, TrendingDown } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CreditAnimationProps {
  show: boolean
  creditsUsed: number
  onComplete?: () => void
}

export function CreditConsumptionAnimation({ 
  show, 
  creditsUsed, 
  onComplete 
}: CreditAnimationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    if (show) {
      // Generate floating particles for visual effect
      const newParticles = Array.from({ length: creditsUsed }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }))
      setParticles(newParticles)

      // Auto-complete after animation
      const timer = setTimeout(() => {
        onComplete?.()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [show, creditsUsed, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-sm mx-auto relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Floating particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 bg-amber-400 rounded-full"
                initial={{ 
                  x: `${particle.x}%`, 
                  y: `${particle.y}%`,
                  opacity: 0,
                  scale: 0
                }}
                animate={{
                  y: [
                    `${particle.y}%`,
                    `${particle.y - 30}%`,
                    `${particle.y - 60}%`
                  ],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  delay: particle.id * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}

            <div className="relative z-10 text-center space-y-4">
              {/* Main credit icon with pulsing animation */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 1, repeat: 2 }}
                className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Coins className="w-8 h-8 text-white" />
              </motion.div>

              {/* Credit consumption text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <motion.h3 
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Credits Used
                </motion.h3>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  className="flex items-center justify-center gap-2"
                >
                  <TrendingDown className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600">
                    -{creditsUsed}
                  </span>
                </motion.div>
              </motion.div>

              {/* Progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto"
                style={{ maxWidth: '200px' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface CreditRefillAnimationProps {
  show: boolean
  creditsAdded: number
  onComplete?: () => void
}

export function CreditRefillAnimation({ 
  show, 
  creditsAdded, 
  onComplete 
}: CreditRefillAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-sm mx-auto relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{ duration: 1.5, repeat: 2 }}
            />

            <div className="relative z-10 text-center space-y-4">
              {/* Energy zap icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Credits Added!
                </h3>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="text-2xl font-bold text-green-600"
                >
                  +{creditsAdded}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}