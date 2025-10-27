"use client"
import { useState } from "react"
import { usePage, router } from "@inertiajs/react"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar"
import { CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Megaphone } from "lucide-react"

export default function Announcements() {
  const { props } = usePage()
  const { announcements = [] } = props

  const [form, setForm] = useState({ title: "", content: "" })
  const [loading, setLoading] = useState(false)

  // ✅ submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    router.post("/admin/announcements", form, {
      preserveScroll: true,
      onSuccess: () => {
        setForm({ title: "", content: "" })
        toast.success("Pengumuman berhasil dikirim!")
      },
      onError: (err) => {
        toast.error("Gagal mengirim pengumuman")
        console.error(err)
      },
      onFinish: () => setLoading(false),
    })
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* ===== Header ===== */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/announcements">
                    Pengumuman
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* ===== Main Content ===== */}
        <div className="flex flex-1 flex-col px-4 lg:px-6 py-6 space-y-6">
          {/* Judul Halaman */}
          <CardHeader className="flex flex-col items-start gap-2 p-0">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">Kelola Pengumuman</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Buat dan kelola pengumuman yang akan ditampilkan di dashboard anggota.
            </p>
          </CardHeader>

          {/* ===== Form Tambah Pengumuman ===== */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
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

            <Button type="submit" disabled={loading} className="w-fit">
              {loading ? "Mengirim..." : "Kirim Pengumuman"}
            </Button>
          </form>

          {/* ===== Daftar Pengumuman ===== */}
          <div className="border-t pt-6 space-y-3 max-w-2xl">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-muted-foreground" />
              Daftar Pengumuman
            </h2>

            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada pengumuman.</p>
            ) : (
              announcements.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 bg-background hover:bg-muted/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {item.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Diterbitkan: {new Date(item.publish_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
