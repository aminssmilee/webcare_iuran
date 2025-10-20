"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function RejectReasonDialog({ target, open, onOpenChange, onReject }) {
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Alasan wajib diisi sebelum menolak.")
      return
    }

    console.log("🚀 Mengirim alasan reject:", reason)
    onReject(reason)         // ✅ panggil parent → handleReject(reason)
    onOpenChange(false)      // ✅ tutup modal
    setReason("")            // ✅ reset alasan
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle>Alasan Penolakan</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <Textarea
            placeholder={`Tuliskan alasan penolakan untuk ${target?.name ?? "user"}...`}
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
