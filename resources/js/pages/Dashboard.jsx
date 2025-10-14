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

import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { router } from "@inertiajs/react"

export default function Dashboard() {
  // Ambil data dari server
  const { props } = usePage()
  const metrics = props.metrics ?? {}
  const chart = props.chart ?? { labels: [], series: {} }
  const initialRange = props.range ?? "90d"

  const [timeRange, setTimeRange] = useState(initialRange)

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
                  <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <CardHeader className="relative">
            {/* Toggle Range */}
            <div className="absolute right-6 top-4">
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={(v) => {
                  if (v && v !== timeRange) {
                    setTimeRange(v)
                    router.visit(`/admin/dashboard?range=${v}`, {
                      preserveState: true,   // biar sidebar dll tidak reload
                      preserveScroll: true,
                      replace: true,         // update URL tanpa reload penuh
                    })
                  }
                }}
                variant="outline"
                className="hidden md:flex"
              >
                <ToggleGroupItem value="90d" className="h-8 px-2.5">Last 3 months</ToggleGroupItem>
                <ToggleGroupItem value="30d" className="h-8 px-2.5">Last 30 days</ToggleGroupItem>
                <ToggleGroupItem value="7d" className="h-8 px-2.5">Last 7 days</ToggleGroupItem>
              </ToggleGroup>

              {/* Select (mobile) */}
              <Select value={timeRange} onValueChange={(v) => {
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
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <div className="flex flex-col gap-4 py-4 md:py-6">
            {/* Cards Statistik */}
            <SectionCards metrics={metrics} />

            {/* Chart */}
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive timeRange={timeRange} data={chart} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
