"use client"
import { useState } from "react"
import { usePage, router } from "@inertiajs/react"
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

  // ✅ Ambil data dari Laravel (paginator)
  const users = props.users?.data || []
  const pageMeta = props.users?.meta || {}
  const filters = props.filters || {}

  // ✅ State default filter (dari server)
  const [q, setQ] = useState(filters.q || "")
  const [status, setStatus] = useState(filters.status || "all")
  const [timeRange, setTimeRange] = useState(filters.timeRange || "90d")

  // 🔍 Apply filters ke server (Inertia request)
  const applyFilters = (extra = {}) => {
    const params = {
      q,
      status,
      timeRange,
      page: extra.page || 1,
      ...extra,
    }

    router.get("/admin/users", params, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    })
  }

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
              {/* 🔎 Search box */}
              <div className="flex items-start justify-start gap-2 w-full md:w-1/3">
                <div className="relative w-full">
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                    placeholder="Cari nama / email / NIK"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button
                  variant="default"
                  className="h-8 w-28"
                  onClick={() => applyFilters()}
                >
                  Search
                </Button>
              </div>

              {/* 🧭 Filter status dan waktu */}
              <div className="flex items-center gap-2">
                {/* Status */}
                <Select
                  value={status}
                  onValueChange={(val) => {
                    setStatus(val)
                    applyFilters({ status: val })
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {/* Time range */}
                <Select
                  value={timeRange}
                  onValueChange={(val) => {
                    setTimeRange(val)
                    applyFilters({ timeRange: val })
                  }}
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

            <div className="px-4 lg:px-2 w-full overflow-x-auto max-w-full">
              <div className="min-w-full">
                <DataTable data={users} columns={getUserColumns()} />
              </div>
            </div>

            {/* 🧭 Pagination */}
            {pageMeta?.last_page > 1 && (
              <div className="flex justify-between items-center mt-4 px-4 pb-2">
                <Button
                  variant="outline"
                  disabled={pageMeta.current_page <= 1}
                  onClick={() =>
                    applyFilters({ page: pageMeta.current_page - 1 })
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
                  disabled={pageMeta.current_page >= pageMeta.last_page}
                  onClick={() =>
                    applyFilters({ page: pageMeta.current_page + 1 })
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
