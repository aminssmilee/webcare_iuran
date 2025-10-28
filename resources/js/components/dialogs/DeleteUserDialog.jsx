"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { router } from "@inertiajs/react"

export function DeleteUserDialog({ user, open, onOpenChange }) {
  const [loading, setLoading] = useState(false)

  function handleDelete() {
    setLoading(true)
    router.delete(`/admin/users/${user.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setLoading(false)
        onOpenChange(false)
      },
      onError: () => {
        setLoading(false)
        alert("Gagal menghapus user.")
      },
      onFinish: () => setLoading(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Hapus User</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus user{" "}
            <span className="font-semibold">{user.name}</span>? <br />
            Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
