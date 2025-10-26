"use client"
import { DialogContent } from "@/components/ui/dialog"

export function ScrollDialogContent({ children, className = "", ...props }) {
  return (
    <DialogContent
      {...props}
      className={`max-h-[90vh] overflow-y-auto rounded-lg max-w-xs lg:max-w-md ${className}`}
      aria-describedby={undefined}
    >
      {children}
    </DialogContent>
  )
}
