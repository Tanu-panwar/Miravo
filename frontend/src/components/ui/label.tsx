"use client"

import * as React from "react"
// Import Radix UI's label component primitives
import * as LabelPrimitive from "@radix-ui/react-label"
// `cva` is used to manage conditional class variants
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils" // Utility to conditionally merge class names

// Define base styles for label using Tailwind CSS and cva
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

// Label component using Radix UI's label as base
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>, // Forwarding ref type to Radix label root
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & // Accepting all props except ref
    VariantProps<typeof labelVariants> // Also accept variant props if needed later
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref} // Forward ref
    className={cn(labelVariants(), className)} // Merge default styles with user-defined className
    {...props} // Spread all other props
  />
))

// Set display name for easier debugging
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
