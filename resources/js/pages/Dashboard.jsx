"use client"

import { useState } from "react"
import { usePage, router } from "@inertiajs/react"
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
import { CardHeader } from "@/components/ui/card"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

export default function Dashboard() {
  const { props } = usePage()
  const metrics = props.metrics ?? {}
  const chart = props.chart ?? { labels: [], series: {} }

  // 🟢 Default = "all" (semua data)
  const initialRange = props.range ?? "all"
  const [timeRange, setTimeRange] = useState(initialRange)

  const handleRangeChange = (v) => {
    if (!v || v === timeRange) return
    setTimeRange(v)
    router.visit(`/admin/dashboard?range=${v}`, {
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
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <CardHeader className="relative">
            <div className="absolute right-6 top-4">
              {/* 🧭 Toggle waktu (Desktop) */}
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={handleRangeChange}
                variant="outline"
                className="hidden md:flex"
              >
                {/* Tidak ada tombol “Semua” — default-nya sudah “all” */}
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

              {/* 🧭 Dropdown (Mobile) */}
              <Select value={timeRange} onValueChange={handleRangeChange}>
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
          </CardHeader>

          <div className="flex flex-col gap-4 py-4 md:py-6">
            {/* Statistik */}
            <SectionCards metrics={metrics} />

            {/* Grafik */}
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive timeRange={timeRange} data={chart} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
