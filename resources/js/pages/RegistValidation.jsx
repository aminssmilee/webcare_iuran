"use client"
import { useState, useMemo, useEffect } from "react"
import axios from "axios"
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
  const initialRegs = Array.isArray(props.registrations?.data)
    ? props.registrations.data
    : Array.isArray(props.registrations)
      ? props.registrations
      : []
  const initialMeta = props.registrations?.meta ?? {}

  // state utama
  const [registrations, setRegistrations] = useState(initialRegs)
  const [pageMeta, setPageMeta] = useState(initialMeta)
  const [pageSize, setPageSize] = useState(initialMeta.per_page || 10)
  const [q, setQ] = useState(props.filters?.q || "")
  const [status, setStatus] = useState(props.filters?.status || "all")
  const [timeRange, setTimeRange] = useState(props.filters?.timeRange || "90d")
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const columns = getRegistrationColumns()

  // 🧩 Fetch data paginated
  const fetchRegistrations = async (extra = {}) => {
    setLoading(true)
    try {
      const res = await axios.get("/admin/pending-registrations", {
        params: {
          q,
          status,
          timeRange,
          page: extra.page || 1,
          per_page: extra.per_page || pageSize,
        },
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })
      setRegistrations(res.data.data)
      setPageMeta(res.data.meta)
    } catch (err) {
      console.error("❌ Gagal ambil data:", err)
    } finally {
      setLoading(false)
    }
  }

  // ⏳ debounce pencarian
  useEffect(() => {
    // 🧩 Hanya fetch pertama kali (saat halaman pertama dibuka)
    if (!hasFetched) {
      setHasFetched(true)
      fetchRegistrations({ page: 1 })
      return
    }

    // ⏳ Kalau ada perubahan filter, baru jalankan debounce fetch
    const delay = setTimeout(() => {
      fetchRegistrations({ page: 1 })
    }, 400)

    return () => clearTimeout(delay)
  }, [q, status, timeRange])

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
          {/* Filter Section */}
          <CardHeader className="relative lg:px-6 w-full">
            <div className="flex flex-wrap items-center gap-2 justify-between w-full">
              {/* 🔍 Pencarian */}
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

          {/* Tabel */}
          <div className="flex flex-col gap-4 p-4 border border-foreground/10 rounded-lg mx-4 overflow-x-auto">
            <h1 className="text-xl font-semibold mb-2">
              Daftar Pendaftaran Pengguna
            </h1>

            {loading && (
              <p className="text-sm text-muted-foreground text-center">
                Loading data...
              </p>
            )}

            {!loading && (
              <div className="w-full min-w-full">
                <DataTable
                  data={registrations}
                  columns={columns}
                  server
                  pageCount={pageMeta?.last_page ?? 1}
                  pagination={{
                    pageIndex: (pageMeta?.current_page ?? 1) - 1,
                    pageSize: pageSize,
                  }}
                  onPaginationChange={(next) => {
                    const nextPage = next.pageIndex + 1
                    if (nextPage !== pageMeta?.current_page) {
                      fetchRegistrations({ page: nextPage, per_page: pageSize })
                    }
                  }}
                  onPageSizeChange={(size) => {
                    setPageSize(size)
                    fetchRegistrations({ page: 1, per_page: size })
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
