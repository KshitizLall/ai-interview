'use client'

import * as React from 'react'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

const CollapsibleTrigger = React.forwardRef<
  Element,
  React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ ...props }, ref) => {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      ref={ref as any}
      data-slot="collapsible-trigger"
      {...props}
    />
  )
})
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<
  Element,
  React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ ...props }, ref) => {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      ref={ref as any}
      data-slot="collapsible-content"
      {...props}
    />
  )
})
CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
