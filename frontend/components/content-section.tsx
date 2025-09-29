import { cn } from "@/lib/utils"

interface ContentSectionProps {
  children: React.ReactNode
  className?: string
}

export function ContentSection({ children, className }: ContentSectionProps) {
  return (
    <section className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
      {children}
    </section>
  )
}
