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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function ManageUsers() {
  const { props } = usePage()
  const initialUsers = Array.isArray(props.users?.data)
    ? props.users.data
    : Array.isArray(props.users)
    ? props.users
    : []
  const initialMeta = props.users?.meta ?? {}

  const [users, setUsers] = useState(initialUsers)
  const [pageMeta, setPageMeta] = useState(initialMeta)
  const [pageSize, setPageSize] = useState(initialMeta.per_page || 10)
  const [q, setQ] = useState(props.filters?.q || "")
  const [status, setStatus] = useState(props.filters?.status || "all")
  const [timeRange, setTimeRange] = useState(props.filters?.timeRange || "90d")
  const [loading, setLoading] = useState(false)

  const columns = getUserColumns()

  // 🧭 Fetch data dari server (pagination + filter)
  const fetchUsers = async (extra = {}) => {
    setLoading(true)
    try {
      const res = await axios.get("/admin/users", {
        params: {
          q,
          status,
          timeRange,
          page: extra.page || 1,
          per_page: extra.per_page || pageSize,
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

  // ⏳ Realtime search debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers({ page: 1 })
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
                  <BreadcrumbLink href="/admin/users">
                    Management Anggota
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main */}
        <div className="flex flex-1 flex-col">
          <CardHeader className="relative lg:px-6 w-full">
            <div className="flex flex-wrap items-center gap-2 justify-between w-full">
              {/* 🔍 Search */}
              <div className="flex items-start justify-start gap-2 w-full md:w-1/3">
                <div className="relative w-full">
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Ketik nama atau email..."
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* 🧭 Filter waktu */}
              <div className="absolute right-6 top-4">
                <ToggleGroup
                  type="single"
                  value={timeRange}
                  onValueChange={(v) => {
                    if (v && v !== timeRange) {
                      setTimeRange(v)
                      fetchUsers({ page: 1 })
                    }
                  }}
                  variant="outline"
                  className="hidden md:flex"
                >
                  <ToggleGroupItem value="90d" className="h-8 px-2.5 font-normal">
                    3 Bulan Terakhir
                  </ToggleGroupItem>
                  <ToggleGroupItem value="30d" className="h-8 px-2.5 font-normal">
                    30 Hari Terakhir
                  </ToggleGroupItem>
                  <ToggleGroupItem value="7d" className="h-8 px-2.5 font-normal">
                    7 Hari Terakhir
                  </ToggleGroupItem>
                </ToggleGroup>

                {/* Mobile Select */}
                <Select
                  value={timeRange}
                  onValueChange={(v) => {
                    if (v && v !== timeRange) {
                      setTimeRange(v)
                      fetchUsers({ page: 1 })
                    }
                  }}
                >
                  <SelectTrigger className="md:hidden flex w-40">
                    <SelectValue placeholder="Pilih rentang waktu" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="90d">3 Bulan Terakhir</SelectItem>
                    <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                    <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          {/* 📋 Tabel */}
          <div className="flex flex-col gap-4 lg:py-2 lg:px-2 p-2 md:gap-2 md:py-4 border border-foreground/10 rounded-lg mx-6 overflow-x-auto">
            <h1 className="text-xl font-semibold m-4">Members List</h1>

            {loading && (
              <p className="text-sm text-muted-foreground text-center">Loading data...</p>
            )}

            {!loading && (
              <div className="px-4 lg:px-2 w-full overflow-x-auto max-w-full">
                <DataTable
                  data={users}
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
                      fetchUsers({ page: nextPage, per_page: pageSize })
                    }
                  }}
                  onPageSizeChange={(size) => {
                    setPageSize(size)
                    fetchUsers({ page: 1, per_page: size })
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
