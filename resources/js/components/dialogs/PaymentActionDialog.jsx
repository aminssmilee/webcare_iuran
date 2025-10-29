"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function PaymentActionDialog({ payment, action, open, onOpenChange, onSubmit }) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert("Mohon isi alasan terlebih dahulu.")
      return
    }

    setLoading(true)
    try {
      // panggil fungsi yang dikirim dari parent (handleReject)
      await onSubmit(reason)
      setReason("")
      onOpenChange(false)
    } catch (error) {
      console.error(`${action} gagal:`, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action} Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <Input
            placeholder={`Masukkan alasan ${action?.toLowerCase()}...`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Mengirim..." : "Kirim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
