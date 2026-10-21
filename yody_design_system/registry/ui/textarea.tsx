import * as React from "react"

import { cn } from "@/lib/utils"

/** Textarea — shadcn/ui open-code, YODY-branded via role tokens (rounded-lg). */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-[color,box-shadow] outline-none field-sizing-content",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
