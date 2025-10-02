"use client"
import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function PaymentActionDialog({
  payment = {},
  action = "Review",
  open,
  onOpenChange,
}) {
  const [reason, setReason] = React.useState("")

  const handleSubmit = () => {
    console.log(
      `Payment ${payment?.id || "-"} action ${action} with reason:`,
      reason
    )
    onOpenChange(false)
  }

  React.useEffect(() => {
    if (open) setReason("") // reset hanya saat dialog dibuka
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{action} Payment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <p>
            Provide a reason for <strong>{action}</strong> on payment{" "}
            <strong>{payment?.id}</strong>:
          </p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason..."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
