"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useOptimizedHandler } from "@/hooks/use-performance"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-6 rounded px-2 text-xs",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-8",
        xl: "h-11 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface OptimizedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Prevents UI blocking by deferring onClick execution
   */
  preventBlocking?: boolean
  /**
   * Debounce time in ms to prevent rapid clicks
   */
  debounceMs?: number
  /**
   * Throttle time in ms to limit execution rate
   */
  throttleMs?: number
  /**
   * Shows loading state during async operations
   */
  loading?: boolean
  /**
   * Loading text to show when loading is true
   */
  loadingText?: string
}

const OptimizedButton = React.forwardRef<HTMLButtonElement, OptimizedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    onClick,
    children,
    disabled,
    preventBlocking = true,
    debounceMs,
    throttleMs,
    loading = false,
    loadingText,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const [isProcessing, setIsProcessing] = React.useState(false)

    // Optimize the onClick handler to prevent UI blocking
    const optimizedOnClick = useOptimizedHandler(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!onClick || loading || isProcessing) return

        setIsProcessing(true)

        try {
          // Handle both sync and async onClick handlers
          await Promise.resolve(onClick(event))
        } catch (error) {
          console.error('Button onClick error:', error)
        } finally {
          // Use requestAnimationFrame to ensure smooth UI update
          requestAnimationFrame(() => {
            setIsProcessing(false)
          })
        }
      },
      {
        defer: preventBlocking,
        debounce: debounceMs,
        throttle: throttleMs,
        nonBlocking: true
      }
    )

    const isDisabled = disabled || loading || isProcessing
    const buttonText = loading ? (loadingText || 'Loading...') : children

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={optimizedOnClick}
        disabled={isDisabled}
        {...props}
      >
        {(loading || isProcessing) && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {buttonText}
      </Comp>
    )
  }
)

OptimizedButton.displayName = "OptimizedButton"

export { OptimizedButton, buttonVariants }