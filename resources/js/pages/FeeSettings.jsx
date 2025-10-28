"use client"
import { useState } from "react"
import { usePage } from "@inertiajs/react"
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
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/DataTable"
import { getFeeSettingTables } from "@/components/data-table/table-colums"
import { FeeEditDialog } from "@/components/dialogs/FeeSettingDialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { router } from "@inertiajs/react"

export default function FeeSettings() {
  const [open, setOpen] = useState(false)
  const { props } = usePage()
  const { fees = [] } = props

  const columns = getFeeSettingTables()

  const data = Array.isArray(fees)
    ? fees.map((fee) => ({
      tahun: fee.tahun,
      member_type: fee.member_type,
      nominal_tahunan: `Rp ${Number(fee.nominal).toLocaleString("id-ID")}`,
      nominal_bulanan: `Rp ${(fee.nominal / 12).toLocaleString("id-ID")}`,
    }))
    : []


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
                  <BreadcrumbLink href="/admin/fee-settings">
                    Pengaturan Iuran
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col p-4 gap-4">
          <div className="flex justify-end gap-4">
            <Select
            // value={timeRange}
            // onValueChange={(v) => {
            //   if (v && v !== timeRange) {
            //     setTimeRange(v)
            //     router.visit(`/admin/dashboard?range=${v}`, {
            //       preserveState: true,
            //       preserveScroll: true,
            //       replace: true,
            //     })
            //   }
            // }}
            >
              <SelectTrigger className="flex w-40">
                <SelectValue placeholder="Tipe anggota" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="perorangan">Perorangan</SelectItem>
                <SelectItem value="institusi">Institusi</SelectItem>
              </SelectContent>
            </Select>

            <Select
            // value={timeRange}
            // onValueChange={(v) => {
            //   if (v && v !== timeRange) {
            //     setTimeRange(v)
            //     router.visit(`/admin/dashboard?range=${v}`, {
            //       preserveState: true,
            //       preserveScroll: true,
            //       replace: true,
            //     })
            //   }
            // }}
            >
              <SelectTrigger className="flex w-40">
                <SelectValue placeholder="Rentang waktu" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="default" onClick={() => setOpen(true)} className="self-end gap-2 w-auto mx-6">
              Perbarui Nominal
            </Button>
          </div>

          <div className="flex flex-col gap-4 lg:py-2 lg:px-2 p-2 md:gap-2 md:py-4 border border-foreground/10 rounded-lg mx-6 overflow-x-auto">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-semibold">
                Pembaruan Nominal Iuran
              </h1>
            </div>

            <div className="px-4 lg:px-2">
              <DataTable data={data} columns={columns} />
            </div>
          </div>
        </div>

        {/* Dialog Edit */}
        <FeeEditDialog open={open} onOpenChange={setOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}
