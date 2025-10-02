import { useState } from "react"
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

// Dummy data anggota
export const usersData = [
  {
    id: 1,
    name: "Budi Santoso",
    email: "budi@example.com",
    status: "Active",
    idNumber: "1234567890",
    birthPlaceDate: "Jakarta, 01-01-1990",
    gender: "Male",
    address: "Jl. Merdeka No.1",
    whatsapp: "081234567890",
    education: "Bachelor's",
    occupation: "Software Engineer",
  },
  {
    id: 2,
    name: "Siti Aminah",
    email: "siti@example.com",
    status: "Inactive",
    idNumber: "0987654321",
    birthPlaceDate: "Bandung, 05-05-1992",
    gender: "Female",
    address: "Jl. Sudirman No.10",
    whatsapp: "081234567891",
    education: "High School",
    occupation: "Teacher",
  },
  {
    id: 3,
    name: "Andi Wijaya",
    email: "andi@example.com",
    status: "Active",
    idNumber: "1122334455",
    birthPlaceDate: "Surabaya, 12-12-1985",
    gender: "Male",
    address: "Jl. Pemuda No.5",
    whatsapp: "081234567892",
    education: "Master's",
    occupation: "Doctor",
  },
]

export default function ManageUsers() {
  const [timeRange, setTimeRange] = useState("90d")

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
                  <BreadcrumbLink href="/data-anggota">
                    Management Anggota
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <CardHeader className="relative lg:px-6 w-full">
            {/* Search + Filter */}
            <div className="flex flex-wrap items-center gap-2 justify-between w-full">
              {/* search */}
              <div className="flex items-start justify-start gap-2 w-full md:w-1/3">
                <div className="relative w-full">
                  <Input
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                    placeholder="Cari nama anggota"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                <Button variant="default" className="h-8 w-28">
                  Search
                </Button>
              </div>

              {/* Filter waktu */}
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="@[767px]/card:hidden flex w-40" aria-label="Select a value">
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

          {/* Table */}
          <div className="flex flex-col gap-4 lg:py-2 lg:px-2 p-2 md:gap-2 md:py-4 border border-foreground/10 rounded-lg mx-6 overflow-x-hidden">
            <h1 className="text-xl font-semibold m-4">Members List</h1>
            <div className="px-4 lg:px-2 w-full overflow-x-auto">
              <DataTable data={usersData} columns={getUserColumns()} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
