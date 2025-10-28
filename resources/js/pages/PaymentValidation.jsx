"use client"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { DataTable } from "@/components/data-table/DataTable"
import { getPaymentValidationColumns } from "@/components/data-table/table-colums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { usePage, router } from "@inertiajs/react"

export default function PaymentValidation() {
  const { props } = usePage()

  // 🔹 Data dari controller Laravel
  const payments = props.payments || {}
  const rows = payments.data || []
  const pageMeta = payments.meta || {}
  const serverFilters = props.filters || {}

  // 🔹 State filter (default dari server)
  const [q, setQ] = useState(serverFilters.q || "")
  const [timeRange, setTimeRange] = useState(serverFilters.timeRange || "90d")
  const [status, setStatus] = useState(serverFilters.status || "Pending")

  // 🔹 Fungsi apply filter
  function applyFilters(extra = {}) {
    const params = {
      q,
      timeRange,
      status,
      page: extra.page || 1,
      ...extra,
    }

    router.get("/admin/payment-validation", params, {
      preserveState: true,
      preserveScroll: true,
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
                  <BreadcrumbLink href="/admin/payment-validation">
                    Member Payment Validation
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
              {/* Search */}
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

              {/* Filters */}
              <div className="absolute right-6 top-4">
                <ToggleGroup
                  type="single"
                  value={timeRange}
                  onValueChange={(v) => {
                    if (v && v !== timeRange) {
                      setTimeRange(v)
                      router.visit(`/admin/dashboard?range=${v}`, {
                        preserveState: true,   // agar sidebar dll tidak reload
                        preserveScroll: true,
                        replace: true,         // update URL tanpa reload penuh
                      })
                    }
                  }}
                  variant="outline"
                  className="hidden md:flex"
                >
                  <ToggleGroupItem value="90d" className="h-8 px-2.5 font-normal">3 Bulan Terakhir</ToggleGroupItem>
                  <ToggleGroupItem value="30d" className="h-8 px-2.5 font-normal">30 Hari Terakhir</ToggleGroupItem>
                  <ToggleGroupItem value="7d" className="h-8 px-2.5 font-normal">7 Hari Terakhir</ToggleGroupItem>
                </ToggleGroup>

                {/* Pilihan (Mobile) */}
                <Select
                  value={timeRange}
                  onValueChange={(v) => {
                    if (v && v !== timeRange) {
                      setTimeRange(v)
                      router.visit(`/admin/dashboard?range=${v}`, {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                      })
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

          {/* Table Section */}
          <div className="flex flex-col gap-4 lg:py-2 lg:px-2 p-2 md:gap-2 md:py-4 border border-foreground/10 rounded-lg mx-6 overflow-x-hidden">
            <h1 className="text-xl font-semibold m-4">Payment Members List</h1>

            {/* Wrapper agar tabel bisa di-scroll horizontal */}
            <div className="px-4 lg:px-2 w-full overflow-x-auto max-w-full">
              <div className="min-w-full">
                <DataTable data={rows} columns={getPaymentValidationColumns()} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
