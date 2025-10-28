"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Plus } from "lucide-react"
import { toast } from "sonner"
import { router } from "@inertiajs/react"

export default function AnnouncementDialog({ onSuccess }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: "", content: "" })

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    router.post("/admin/announcements", form, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Pengumuman berhasil dikirim!")
        setForm({ title: "", content: "" })
        setOpen(false)
        onSuccess?.()
      },
      onError: () => toast.error("Gagal mengirim pengumuman"),
      onFinish: () => setLoading(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          Tambah Pengumuman
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Pengumuman</DialogTitle>
          <DialogDescription>
            Isi form berikut untuk membuat pengumuman baru.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Judul Pengumuman</label>
            <Input
              placeholder="Masukkan judul..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Isi Pengumuman</label>
            <Textarea
              placeholder="Masukkan isi pengumuman..."
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Mengirim..." : "Kirim Pengumuman"}
              {!loading }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
