"use client"

import { useState } from "react"
import { Inertia } from "@inertiajs/inertia"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function PaymentActionDialog({ payment, action, open, onOpenChange }) {
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Mohon isi alasan terlebih dahulu.")
      return
    }

    const routeMap = {
      Reject: "reject",
      Overpaid: "overpaid",
      Expired: "expired",
    }

    const endpoint = `/admin/payment-validation/${payment.id}/${routeMap[action]}`

    Inertia.post(endpoint, { reason }, {
      preserveScroll: true,
      onSuccess: () => {
        console.log(`${action} success`)
        onOpenChange(false)
      },
      onError: (err) => {
        console.error(`${action} gagal:`, err)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action} Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <Input
            placeholder={`Masukkan alasan ${action.toLowerCase()}...`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>Kirim</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
