"use client"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CardHeader } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { DataTable } from "@/components/data-table/DataTable"
import { getPaymentValidationColumns } from "@/components/data-table/table-colums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { usePage, router } from "@inertiajs/react"

export default function PaymentValidation() {
  const { props } = usePage()
  const serverPayments = props.payments || []   // dari controller
  const serverFilters  = props.filters || {}

  const [q, setQ] = useState(serverFilters.q || "")
  const [timeRange, setTimeRange] = useState(serverFilters.timeRange || "90d")
  const [status, setStatus] = useState(serverFilters.status || "Pending")

  function applyFilters(extra = {}) {
    const params = {
      q,
      timeRange,
      status,
      ...extra,
    }
    router.get(route("admin.payment.validation"), params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    })
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <CardHeader className="relative lg:px-6 w-full">
            <div className="flex items-center justify-between gap-2 lg:pl-6 flex-col lg:flex-row">
              {/* Search */}
              <div className="flex items-start justify-start gap-2 lg:w-1/3 w-full md:w-1/2 -ml-6">
                <div className="relative w-full">
                  <Input
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                    placeholder="Search by month (e.g. October / 2025-10)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') applyFilters() }}
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button variant="default" className="h-8 w-20 lg:w-28 md:w-1/3" onClick={() => applyFilters()}>
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                {/* Status */}
                <Select
                  value={status}
                  onValueChange={(val) => { setStatus(val); applyFilters({ status: val }) }}
                >
                  <SelectTrigger className="flex w-40" aria-label="Select a value">
                    <SelectValue placeholder="Pending" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Pending" className="rounded-lg">Pending</SelectItem>
                    <SelectItem value="Completed" className="rounded-lg">Completed</SelectItem>
                    <SelectItem value="Failed" className="rounded-lg">Failed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Time range */}
                <Select
                  value={timeRange}
                  onValueChange={(val) => { setTimeRange(val); applyFilters({ timeRange: val }) }}
                >
                  <SelectTrigger className="flex w-40" aria-label="Select a value">
                    <SelectValue placeholder="Last 3 months" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                    <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                    <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <div className="flex flex-col gap-4 lg:py-2 lg:px-2 p-2 md:gap-2 md:py-4 border border-foreground/10 rounded-lg mx-6">
            <h1 className="text-xl font-semibold m-4">Payment Members List</h1>

            <div className="px-4 lg:px-4">
              <div className="w-full lg:overflow-x-auto max-w-full">
                <DataTable data={serverPayments} columns={getPaymentValidationColumns()} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
