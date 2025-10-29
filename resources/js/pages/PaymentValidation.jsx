"use client"
import { useState, useEffect } from "react"
import axios from "axios"
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
import { getPaymentValidationColumns } from "@/components/data-table/table-colums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { usePage } from "@inertiajs/react"

export default function PaymentValidation() {
  const { props } = usePage()
  const initialPayments = Array.isArray(props.payments?.data)
    ? props.payments.data
    : Array.isArray(props.payments)
      ? props.payments
      : []
  const initialMeta = props.payments?.meta ?? {}

  // =======================
  // 🔹 State Utama
  // =======================
  const [payments, setPayments] = useState(initialPayments)
  const [pageMeta, setPageMeta] = useState(initialMeta)
  const [pageSize, setPageSize] = useState(initialMeta.per_page || 10)
  const [q, setQ] = useState(props.filters?.q || "")
  const [status, setStatus] = useState(props.filters?.status || "Pending")
  const [timeRange, setTimeRange] = useState(props.filters?.timeRange || "all")
  const [loading, setLoading] = useState(false)

  const columns = getPaymentValidationColumns()

  // =======================
  // ⚙️ Fetch via AJAX
  // =======================
  const fetchPayments = async (extra = {}) => {
    setLoading(true)
    try {
      const res = await axios.get("/admin/payment-validation", {
        params: {
          q,
          status,
          timeRange,
          page: extra.page || 1,
          per_page: extra.per_page || pageSize,
        },
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })

      setPayments(res.data.data)
      setPageMeta(res.data.meta)
    } catch (err) {
      console.error("❌ Error fetching payments:", err)
    } finally {
      setLoading(false)
    }
  }

  // 🔁 Re-fetch saat filter berubah (dengan debounce)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchPayments({ page: 1 })
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
                    placeholder="Ketik nama atau email..."
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Filters */}
              <div className="absolute right-6 top-4 flex gap-2 items-center">
                {/* Filter waktu */}
                {/* Filter waktu */}
                <ToggleGroup
                  type="single"
                  value={timeRange}
                  onValueChange={(v) => {
                    if (v && v !== timeRange) {
                      setTimeRange(v)
                      fetchPayments({ page: 1 })
                    }
                  }}
                  variant="outline"
                  className="hidden md:flex"
                >
                  <ToggleGroupItem value="all" className="h-8 px-2.5 font-normal">Semua</ToggleGroupItem>
                  <ToggleGroupItem value="90d" className="h-8 px-2.5 font-normal">3 Bulan</ToggleGroupItem>
                  <ToggleGroupItem value="30d" className="h-8 px-2.5 font-normal">30 Hari</ToggleGroupItem>
                  <ToggleGroupItem value="7d" className="h-8 px-2.5 font-normal">7 Hari</ToggleGroupItem>
                </ToggleGroup>

                {/* Mobile Select */}
                <Select
                  value={timeRange}
                  onValueChange={(v) => {
                    if (v && v !== timeRange) {
                      setTimeRange(v)
                      fetchPayments({ page: 1 })
                    }
                  }}
                >
                  <SelectTrigger className="md:hidden flex w-40">
                    <SelectValue placeholder="Pilih rentang waktu" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="90d">3 Bulan Terakhir</SelectItem>
                    <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                    <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filter Status */}
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v)
                    fetchPayments({ page: 1 })
                  }}
                >
                  <SelectTrigger className="flex w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          {/* Table Section */}
          <div className="flex flex-col gap-4 lg:py-2 lg:px-2 p-2 md:gap-2 md:py-4 border border-foreground/10 rounded-lg mx-6 overflow-x-hidden">
            <h1 className="text-xl font-semibold m-4">Payment Members List</h1>

            {loading && (
              <p className="text-sm text-muted-foreground text-center">
                Loading data...
              </p>
            )}

            {!loading && (
              <div className="px-4 lg:px-2 w-full overflow-x-auto max-w-full">
                <div className="min-w-full">
                  <DataTable
                    data={payments}
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
                        fetchPayments({ page: nextPage, per_page: pageSize })
                      }
                    }}
                    onPageSizeChange={(size) => {
                      setPageSize(size)
                      fetchPayments({ page: 1, per_page: size })
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
