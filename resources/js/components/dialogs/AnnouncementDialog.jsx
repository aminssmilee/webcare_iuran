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
import axios from "axios"
import { toast } from "sonner"

export default function AnnouncementDialog({ onSuccess }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: "", content: "" })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post("/admin/announcements", form, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })

      toast.success("Pengumuman berhasil ditambahkan!")

      // ✅ kirim data baru ke parent tanpa reload
      onSuccess?.(res.data.announcement)

      setForm({ title: "", content: "" })
      setOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Gagal mengirim pengumuman.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">Tambah Pengumuman</Button>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Pengumuman"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
