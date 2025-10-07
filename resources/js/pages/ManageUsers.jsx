// resources/js/Pages/ManageUsers.jsx
"use client"
import { useState } from "react"
import { usePage, router, Link } from "@inertiajs/react"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CardHeader } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { DataTable } from "@/components/data-table/DataTable"
import { getUserColumns } from "@/components/data-table/table-colums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function ManageUsers() {
  const { props } = usePage()
  const users   = props.users || []
  const filters = props.filters || {}
  const [timeRange, setTimeRange] = useState("90d")
  const [q, setQ] = useState(filters.q || "")

  const submitSearch = () => {
    router.get('/admin/users', { q }, { preserveState: true, replace: true })
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>

        {/*  Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 overflow-hidden">
          <div className="flex items-center gap-2 w-full">
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

        {/* Content area */}
        <div className="flex flex-col flex-1 max-w-full overflow-x-hidden overflow-y-auto">
          <CardHeader className="relative lg:px-6 w-full overflow-x-hidden">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              {/*  Search bar */}
              <div className="flex items-start justify-start gap-2 w-full md:w-1/3">
                <div className="relative w-full">
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                    placeholder="Cari nama/email/NIK"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button variant="default" className="h-8 w-28" onClick={submitSearch}>
                  Search
                </Button>
              </div>

              {/*  Time filter */}
              <Select value={timeRange} onValueChange={setTimeRange}>
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
          </CardHeader>

          {/*  Table area */}
          <div className="flex flex-col gap-4 lg:py-2 lg:px-2 p-2 md:gap-2 md:py-4 border border-foreground/10 rounded-lg mx-6 bg-background overflow-x-hidden">
            <h1 className="text-xl font-semibold m-4">Members List</h1>
            {/*  Tabel scrollable horizontal */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <DataTable data={users} columns={getUserColumns()} />
              </div>
            </div>
          </div>
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
