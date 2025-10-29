"use client"

import { useState, useMemo } from "react"
import axios from "axios"
import { usePage } from "@inertiajs/react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trash } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { toast } from "sonner"
import AnnouncementDialog from "@/components/dialogs/AnnouncementDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function AnnouncementsPage() {
  const { props } = usePage()
  const [announcements, setAnnouncements] = useState(
    Array.isArray(props.announcements) ? props.announcements : []
  )

  // 🔹 Ambil tahun unik dari semua pengumuman
  const years = Array.from(
    new Set(
      announcements.map((a) =>
        new Date(a.publish_date).getFullYear().toString()
      )
    )
  ).sort((a, b) => b - a)

  const [selectedYear, setSelectedYear] = useState("all")

  // 🔹 Filter pengumuman berdasarkan tahun
  const filteredAnnouncements = useMemo(() => {
    if (selectedYear === "all") return announcements
    return announcements.filter((a) => {
      const year = new Date(a.publish_date).getFullYear().toString()
      return year === selectedYear
    })
  }, [announcements, selectedYear])

  const [loadingId, setLoadingId] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🗑️ Hapus pengumuman
  const handleDelete = async (id) => {
    setLoadingId(id)
    try {
      await axios.delete(`/admin/announcements/${id}`)
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
      toast.error("Pengumuman berhasil dihapus!", {
        style: { background: "#FEE2E2", color: "#991B1B", fontWeight: 600 },
        duration: 2000,
      })
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghapus pengumuman.")
    } finally {
      setLoadingId(null)
      setDeletingItem(null)
    }
  }

  // ✅ Tambahkan callback agar data baru langsung muncul
  const handleNewAnnouncement = (newAnnouncement) => {
    setAnnouncements((prev) => [newAnnouncement, ...prev])
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* ===== Header ===== */}
        <header className="flex h-16 shrink-0 items-center gap-2">
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
        <div className="flex flex-1 flex-col px-4 lg:px-8 py-8 bg-background">
          {/* 🔹 Bagian filter & tambah */}
          <div className="flex items-center justify-end gap-4 mb-6">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="flex w-44">
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Tahun</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <AnnouncementDialog onSuccess={handleNewAnnouncement} />
          </div>

          {/* 🔹 Daftar pengumuman */}
          <div className="w-full space-y-4 border border-border/60 p-6 rounded-lg bg-card">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                Daftar Pengumuman{" "}
                {selectedYear !== "all" && (
                  <span className="text-muted-foreground">({selectedYear})</span>
                )}
              </h2>
            </div>

            {filteredAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Belum ada pengumuman untuk tahun ini.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredAnnouncements.map((item) => (
                  <Card
                    key={item.id}
                    className="border border-border/60 shadow-sm hover:shadow-md transition-all"
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-base">{item.title}</h3>

                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className="text-xs flex items-center gap-1 px-2 py-0.5"
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(item.publish_date).toLocaleDateString("id-ID")}
                          </Badge>

                          <Button
                            variant="link"
                            size="icon"
                            disabled={loadingId === item.id}
                            onClick={() => setDeletingItem(item)}
                            className={`h-7 w-7 ${
                              loadingId === item.id
                                ? "cursor-wait opacity-60"
                                : "text-muted-foreground hover:text-destructive"
                            }`}
                          >
                            {loadingId === item.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                            ) : (
                              <Trash className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* 🔹 Dialog konfirmasi hapus */}
      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Pengumuman</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengumuman{" "}
              <span className="font-semibold text-foreground">
                {deletingItem?.title}
              </span>
              ?<br />
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingItem(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deletingItem.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
