"use client"
import { useState } from "react"
import { usePage } from "@inertiajs/react"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar"
import { CardHeader } from "@/components/ui/card"
import {
  ToggleGroup, ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"

// pastikan path ini sesuai dengan file komponenmu
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

export default function Page() {
  // ambil data dari server (Inertia)
  const { props } = usePage()
  const metrics = props.metrics ?? {}     // {revenue, newCustomers, activeAccounts, growthRate}
  const chart   = props.chart   ?? null   // bebas: sesuaikan struktur yang kamu kirim dari controller
  const initialRange = props.range ?? "90d"

  const [timeRange, setTimeRange] = useState(initialRange)

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
                  <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <CardHeader className="relative">
            <div className="absolute right-6 top-4">
              {/* Toggle group (desktop) */}
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={(v) => v && setTimeRange(v)}
                variant="outline"
                className="@[767px]/card:flex hidden"
              >
                <ToggleGroupItem value="90d" className="h-8 px-2.5">Last 3 months</ToggleGroupItem>
                <ToggleGroupItem value="30d" className="h-8 px-2.5">Last 30 days</ToggleGroupItem>
                <ToggleGroupItem value="7d"  className="h-8 px-2.5">Last 7 days</ToggleGroupItem>
              </ToggleGroup>

              {/* Select (mobile) */}
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="@[767px]/card:hidden flex w-40" aria-label="Select a value">
                  <SelectValue placeholder="Last 3 months" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                  <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                  <SelectItem value="7d"  className="rounded-lg">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* kartu statistik – ambil dari props */}
              <SectionCards metrics={metrics} />

              {/* chart – kalau komponenmu menerima props, kirimkan di sini */}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive
                  timeRange={timeRange}
                  data={chart}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
