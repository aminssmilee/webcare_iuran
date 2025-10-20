"use client"
import { useState, useEffect } from "react"
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
import { getUserColumns } from "@/components/data-table/table-colums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function ManageUsers() {
  const { props } = usePage()

  // 🔹 Ambil data awal dari Laravel (Inertia)
  const [users, setUsers] = useState(props.users?.data || [])
  const [pageMeta, setPageMeta] = useState(props.users?.meta || {})
  const [q, setQ] = useState(props.filters?.q || "")
  const [status, setStatus] = useState(props.filters?.status || "all")
  const [timeRange, setTimeRange] = useState(props.filters?.timeRange || "90d")
  const [loading, setLoading] = useState(false)

  // =====================================================
  // ⚡️ Fungsi Ambil Data via AJAX (tanpa reload Inertia)
  // =====================================================
  const fetchUsers = async (extra = {}) => {
    setLoading(true)
    try {
      const res = await axios.get("/admin/users", {
        params: {
          q,
          status,
          timeRange,
          page: extra.page || 1,
        },
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })

      setUsers(res.data.data)
      setPageMeta(res.data.meta)
    } catch (err) {
      console.error("❌ Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // 🕒 Auto Search Realtime (Debounce 400ms)
  // =====================================================
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers()
    }, 400) // delay 0.4 detik tiap user ngetik agar gak spam request
    return () => clearTimeout(delay)
  }, [q, status, timeRange])

  // =====================================================
  // 🎨 Tampilan Utama
  // =====================================================
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
                  <BreadcrumbLink href="/admin/users">
                    Management Anggota
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Filter Section */}
          <CardHeader className="relative lg:px-6 w-full">
            <div className="flex flex-wrap items-center gap-2 justify-between w-full">
              
              {/* 🔎 Search Box */}
              <div className="flex items-start justify-start gap-2 w-full md:w-1/3">
                <div className="relative w-full">
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Keta nama atau email..."
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* 🧭 Filter status dan waktu */}
              <div className="flex items-center gap-2">
                {/* Status */}
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Status</SelectItem>
                    {/* <SelectItem value="pending">Pending</SelectItem> */}
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {/* Time range */}
                <Select
                  value={timeRange}
                  onValueChange={(val) => setTimeRange(val)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Last 3 months" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          {/* 📋 Table Section */}
          <div className="flex flex-col gap-4 lg:py-2 lg:px-2 p-2 md:gap-2 md:py-4 border border-foreground/10 rounded-lg mx-6 overflow-x-auto">
            <h1 className="text-xl font-semibold m-4">Members List</h1>

            {loading && (
              <p className="text-sm text-muted-foreground text-center">
                Loading data...
              </p>
            )}

            {!loading && (
              <div className="px-4 lg:px-2 w-full overflow-x-auto max-w-full">
                <div className="min-w-full">
                  <DataTable data={users} columns={getUserColumns()} />
                </div>
              </div>
            )}

            {/* 🧭 Pagination */}
            {pageMeta?.last_page > 1 && (
              <div className="flex justify-between items-center mt-4 px-4 pb-2">
                <Button
                  variant="outline"
                  disabled={pageMeta.current_page <= 1 || loading}
                  onClick={() =>
                    fetchUsers({ page: pageMeta.current_page - 1 })
                  }
                >
                  Prev
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {pageMeta.current_page} of {pageMeta.last_page} • Total{" "}
                  {pageMeta.total}
                </span>

                <Button
                  variant="outline"
                  disabled={pageMeta.current_page >= pageMeta.last_page || loading}
                  onClick={() =>
                    fetchUsers({ page: pageMeta.current_page + 1 })
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
