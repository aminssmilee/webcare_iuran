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
import { DataTable } from "@/components/data-table/DataTable"
import { columns } from "@/components/data-table/coloums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

// Dummy data anggota
export const anggotaData = [
  {
    id: 1,
    nama: "Budi Santoso",
    email: "budi@example.com",
    status: "Aktif",
    nik: "1234567890",
    ttl: "Jakarta, 01-01-1990",
    gender: "Laki-laki",
    alamat: "Jl. Merdeka No.1",
    noWA: "081234567890",
    // noHP: "081234567890",
    pendidikan: "S1",
    pekerjaan: "Software Engineer",
  },
  {
    id: 2,
    nama: "Siti Aminah",
    email: "siti@example.com",
    status: "Pasif",
    nik: "0987654321",
    ttl: "Bandung, 05-05-1992",
    gender: "Perempuan",
    alamat: "Jl. Sudirman No.10",
    noWA: "081234567891",
    // noHP: "081234567891",
    pendidikan: "SMA",
    pekerjaan: "Guru",
  },
  {
    id: 3,
    nama: "Andi Wijaya",
    email: "andi@example.com",
    status: "Aktif",
    nik: "1122334455",
    ttl: "Surabaya, 12-12-1985",
    gender: "Laki-laki",
    alamat: "Jl. Pemuda No.5",
    noWA: "081234567892",
    // noHP: "081234567892",
    pendidikan: "S2",
    pekerjaan: "Dokter",
  },
]

export default function DataAnggota() {
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
            {/* Select dropdown */}
            <div className="flex items-center gap-2 px-4">
              {/* search */}
              <div className="flex items-start justify-start gap-2 w-1/3">
                <div className="relative w-full">
                  <Input
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                    placeholder="Cari nama anggota"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                <Button variant="default" className="h-8 w-full lg:w-28">
                  Search
                </Button>
              </div>


              <div className="absolute right-6 top-4">
                {/* Toggle group */}
                <ToggleGroup
                  type="single"
                  value={timeRange}
                  onValueChange={setTimeRange}
                  variant="outline"
                  className="@[767px]/card:flex hidden"
                >
                  <ToggleGroupItem value="90d" className="h-8 px-2.5">Last 3 months</ToggleGroupItem>
                  <ToggleGroupItem value="30d" className="h-8 px-2.5">Last 30 days</ToggleGroupItem>
                  <ToggleGroupItem value="7d" className="h-8 px-2.5">Last 7 days</ToggleGroupItem>
                </ToggleGroup>

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
            </div>
          </CardHeader>

          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <DataTable data={anggotaData} columns={columns} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}