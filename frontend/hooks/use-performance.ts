import { useCallback, useRef } from 'react'

/**
 * Custom hook for performance optimization to prevent UI blocking
 */
export function usePerformance() {
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  /**
   * Debounced function that prevents excessive calls
   */
  const debounce = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    delay: number,
    key?: string
  ): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
      const timeoutKey = key || 'default'
      
      // Clear existing timeout
      const existingTimeout = timeoutRefs.current.get(timeoutKey)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        func(...args)
        timeoutRefs.current.delete(timeoutKey)
      }, delay)

      timeoutRefs.current.set(timeoutKey, timeout)
    }
  }, [])

  /**
   * Non-blocking execution using requestAnimationFrame
   */
  const nonBlocking = useCallback(<T extends (...args: any[]) => void>(
    func: T
  ): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
      requestAnimationFrame(() => {
        func(...args)
      })
    }
  }, [])

  /**
   * Deferred execution using setTimeout(0) for heavy operations
   */
  const defer = useCallback(<T extends (...args: any[]) => Promise<void> | void>(
    func: T
  ): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
      setTimeout(() => {
        func(...args)
      }, 0)
    }
  }, [])

  /**
   * Chunked processing for large data sets
   */
  const processInChunks = useCallback(<T>(
    items: T[],
    processor: (item: T, index: number) => void,
    chunkSize: number = 10,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve) => {
      let currentIndex = 0

      const processChunk = () => {
        const endIndex = Math.min(currentIndex + chunkSize, items.length)
        
        for (let i = currentIndex; i < endIndex; i++) {
          processor(items[i], i)
        }

        currentIndex = endIndex
        const progress = (currentIndex / items.length) * 100

        if (onProgress) {
          onProgress(progress)
        }

        if (currentIndex < items.length) {
          // Use requestAnimationFrame for smooth processing
          requestAnimationFrame(processChunk)
        } else {
          resolve()
        }
      }

      // Start processing
      requestAnimationFrame(processChunk)
    })
  }, [])

  /**
   * Throttled function that limits execution rate
   */
  const throttle = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    limit: number,
    key?: string
  ): ((...args: Parameters<T>) => void) => {
    const throttleKey = key || 'default'
    let inThrottle = false

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  }, [])

  /**
   * Cleanup function to clear all timeouts
   */
  const cleanup = useCallback(() => {
    timeoutRefs.current.forEach((timeout) => {
      clearTimeout(timeout)
    })
    timeoutRefs.current.clear()
  }, [])

  return {
    debounce,
    nonBlocking,
    defer,
    processInChunks,
    throttle,
    cleanup
  }
}

/**
 * Hook for optimizing event handlers
 */
export function useOptimizedHandler<T extends (...args: any[]) => void>(
  handler: T,
  options: {
    debounce?: number
    throttle?: number
    defer?: boolean
    nonBlocking?: boolean
  } = {}
): (...args: Parameters<T>) => void {
  const { debounce, nonBlocking, defer, throttle } = usePerformance()

  return useCallback((...args: Parameters<T>) => {
    let optimizedHandler = handler

    if (options.nonBlocking) {
      optimizedHandler = nonBlocking(optimizedHandler) as T
    }

    if (options.defer) {
      optimizedHandler = defer(optimizedHandler) as T
    }

    if (options.debounce) {
      optimizedHandler = debounce(optimizedHandler, options.debounce) as T
    }

    if (options.throttle) {
      optimizedHandler = throttle(optimizedHandler, options.throttle) as T
    }

    optimizedHandler(...args)
  }, [handler, options.debounce, options.throttle, options.defer, options.nonBlocking, debounce, nonBlocking, defer, throttle])
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor() {
  const measurePerformance = useCallback(<T>(
    name: string,
    func: () => T | Promise<T>
  ): Promise<T> => {
    return new Promise(async (resolve, reject) => {
      const start = performance.now()
      
      try {
        const result = await func()
        const end = performance.now()
        const duration = end - start
        
        // Log performance if it's slow
        if (duration > 16) { // More than one frame at 60fps
          console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`)
        }
        
        resolve(result)
      } catch (error) {
        const end = performance.now()
        const duration = end - start
        console.error(`Performance error in ${name}: ${duration.toFixed(2)}ms`, error)
        reject(error)
      }
    })
  }, [])

  return { measurePerformance }
}