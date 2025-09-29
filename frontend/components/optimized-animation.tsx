"use client"

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

interface OptimizedAnimationProps {
  children: React.ReactNode
  className?: string
  animationClass?: string
  fallbackClass?: string
}

export function OptimizedAnimation({ 
  children, 
  className, 
  animationClass = '', 
  fallbackClass = '' 
}: OptimizedAnimationProps) {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <div className={cn(
      className,
      prefersReducedMotion ? fallbackClass : animationClass
    )}>
      {children}
    </div>
  )
}