"use client"
import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function RejectReasonDialog({ target, open, onOpenChange }) {
  const [reason, setReason] = React.useState("")

  const handleSubmit = () => {
    console.log(`Rejected ${target.name} for reason:`, reason)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Registration</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <p>Provide a reason for rejecting <strong>{target.name}</strong>:</p>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection..." />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
