"use client"

import { router } from "@inertiajs/react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function DeleteUserDialog({ user, open, onOpenChange }) {
  if (!user) return null

  const handleDelete = () => {
    router.delete(`/admin/users/${user.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        window.dispatchEvent(
          new CustomEvent("user-deleted", { detail: { id: user.id } })
        )

        toast.success(`User ${user.name} berhasil dihapus!`, {
          style: { background: "#fee2e2", color: "#991b1b", fontWeight: 600 },
          duration: 2500,
        })
        onOpenChange(false)
      },
      onError: () => {
        toast.error("Gagal menghapus user!", {
          style: { background: "#fee2e2", color: "#991b1b", fontWeight: 600 },
          duration: 2500,
        })
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Hapus User</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Apakah kamu yakin ingin menghapus user <b>{user.name}</b>?
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <DialogFooter className="flex justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
          >
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
