"use client"
import { useState, useMemo } from "react"
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
  const registrations = props.registrations || [] // ✅ sesuai controller

  // Filter state
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [timeRange, setTimeRange] = useState("90d")

  // Filter logic
  const filteredData = useMemo(() => {
    const now = new Date()
    const getDateLimit = (days) => {
      const d = new Date()
      d.setDate(d.getDate() - days)
      return d
    }

    return registrations.filter((item) => {
      // Status match
      const matchStatus =
        status === "all"
          ? true
          : item.validationStatus.toLowerCase() === status.toLowerCase()

      // Search match (name, email, month)
      const matchSearch =
        q === "" ||
        item.name?.toLowerCase().includes(q.toLowerCase()) ||
        item.email?.toLowerCase().includes(q.toLowerCase()) ||
        item.submittedAt?.toLowerCase().includes(q.toLowerCase())

      // Time filter
      let matchTime = true
      if (timeRange === "7d")
        matchTime = new Date(item.submittedAt) >= getDateLimit(7)
      else if (timeRange === "30d")
        matchTime = new Date(item.submittedAt) >= getDateLimit(30)
      else if (timeRange === "90d")
        matchTime = new Date(item.submittedAt) >= getDateLimit(90)

      return matchStatus && matchSearch && matchTime
    })
  }, [registrations, q, status, timeRange])

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
                    Member Registration Validation
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
              <div className="flex items-start gap-2 w-full md:w-1/3">
                <div className="relative w-full">
                  <Input
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                    placeholder="Search name / email / month"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button className="h-8 w-20" onClick={() => setQ(q.trim())}>
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                {/* Status Filter */}
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {/* Time Range Filter */}
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          {/* Table Section */}
          <div className="flex flex-col gap-4 p-4 border border-foreground/10 rounded-lg mx-4 overflow-x-auto">
            <h1 className="text-xl font-semibold mb-2">User Registrations</h1>
            <div className="w-full min-w-full">
              <DataTable data={filteredData} columns={getRegistrationColumns()} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
