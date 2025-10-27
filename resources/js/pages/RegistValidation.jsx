"use client"
import { useState, useMemo, useEffect } from "react"
import { usePage } from "@inertiajs/react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { DataTable } from "@/components/data-table/DataTable"
import { getRegistrationColumns } from "@/components/data-table/table-colums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function RegistValidation() {
  const { props } = usePage()
  const registrations = props.registrations || []

  // ✅ Tambahan: ambil flash message dari Laravel
  const flash = props.flash || {}
  const [hasShownFlash, setHasShownFlash] = useState(false)

  // ✅ Tampilkan alert ketika ada flash message (success/error)
  useEffect(() => {
    if (!hasShownFlash) {
      if (flash.success) {
        alert(flash.success)
        console.log("✅ Success:", flash.success)
        setHasShownFlash(true)
      } else if (flash.error) {
        alert(flash.error)
        console.warn("⚠️ Error:", flash.error)
        setHasShownFlash(true)
      }
    }
  }, [flash, hasShownFlash])

  // -----------------------------
  // Filter state dan logika lama
  // -----------------------------
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [timeRange, setTimeRange] = useState("90d")

  const filteredData = useMemo(() => {
    const now = new Date()
    const getDateLimit = (days) => {
      const d = new Date()
      d.setDate(d.getDate() - days)
      return d
    }

    return registrations.filter((item) => {
      const matchStatus =
        status === "all"
          ? true
          : item.validationStatus.toLowerCase() === status.toLowerCase()

      const matchSearch =
        q === "" ||
        item.name?.toLowerCase().includes(q.toLowerCase()) ||
        item.email?.toLowerCase().includes(q.toLowerCase()) ||
        item.submittedAt?.toLowerCase().includes(q.toLowerCase())

      let matchTime = true
      if (timeRange === "7d")
        matchTime = new Date(item.submittedAt) >= getDateLimit(7)
      else if (timeRange === "30d")
        matchTime = new Date(item.submittedAt) >= getDateLimit(30)
      else if (timeRange === "90d")
        matchTime = new Date(item.submittedAt) >= getDateLimit(90)

      return matchStatus && matchSearch && matchTime
    })
  }, [registrations, q, status, timeRange])

  // -----------------------------
  // Tampilan utama (tidak diubah)
  // -----------------------------
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/pending-registrations">
                    Validasi Pendaftaran Member
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main */}
        <div className="flex flex-1 flex-col">
          {/* Bagian Filter */}
          <CardHeader className="relative lg:px-6 w-full">
            <div className="flex flex-wrap items-center gap-2 justify-between w-full">
              {/* Pencarian */}
              <div className="flex items-start justify-start gap-2 w-full md:w-1/3">
                <div className="relative w-full">
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari nama atau email..."
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                {/* Filter Status */}
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="active">Disetujui</SelectItem>
                    {/* <SelectItem value="inactive">Tidak Aktif</SelectItem> */}
                  </SelectContent>
                </Select>

                {/* Filter Rentang Waktu */}
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Rentang Waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                    <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                    <SelectItem value="90d">3 Bulan Terakhir</SelectItem>
                    <SelectItem value="all">Sepanjang Waktu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          {/* Bagian Tabel */}
          <div className="flex flex-col gap-4 p-4 border border-foreground/10 rounded-lg mx-4 overflow-x-auto">
            <h1 className="text-xl font-semibold mb-2">Daftar Pendaftaran Pengguna</h1>
            <div className="w-full min-w-full">
              <DataTable data={filteredData} columns={getRegistrationColumns()} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
