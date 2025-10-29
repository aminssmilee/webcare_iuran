"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { usePage } from "@inertiajs/react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/DataTable"
import { getFeeSettingTables } from "@/components/data-table/table-colums"
import { FeeEditDialog } from "@/components/dialogs/FeeSettingDialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// import { toast } from "sonner"

export default function FeeSettings() {
  const { props } = usePage()
  const initialFees = Array.isArray(props.fees?.data) ? props.fees.data : (Array.isArray(props.fees) ? props.fees : [])
  const initialMeta = props.fees?.meta ?? {}
  const initialFilters = props.filters ?? {}

  // state
  const [open, setOpen] = useState(false)
  const [fees, setFees] = useState(initialFees) // ✅ aktifkan kembali ini!
  const [pageMeta, setPageMeta] = useState(initialMeta)
  const [memberType, setMemberType] = useState(initialFilters.member_type || "all")
  const [year, setYear] = useState(initialFilters.year || "all")
  const [loading, setLoading] = useState(false)
  const [pageSize, setPageSize] = useState(10)

  // hapus baris ini karena duplikat
  // const { fees = [], filters = {} } = usePage().props

  // cukup ambil filters langsung
  const filters = props.filters ?? {}
  const yearsList = filters.years_list ?? []


  // const [pageSize, setPageSize] = useState(initialMeta.per_page || 10)
  // const [pageSize, setPageSize] = useState(10)

  const columns = getFeeSettingTables()

  const tableData = Array.isArray(fees)
    ? fees.map((fee) => ({
      id: fee.id,
      tahun: fee.tahun,
      member_type: fee.member_type,
      nominal_tahunan: `Rp ${Number(fee.nominal).toLocaleString("id-ID")}`,
      nominal_bulanan: `Rp ${Math.floor(Number(fee.nominal) / 12).toLocaleString("id-ID")}`,
    }))
    : []

  // fetch data via AJAX

  const fetchFees = async (extra = {}) => {
    setLoading(true)
    try {
      const res = await axios.get("/admin/fee-settings", {
        params: {
          member_type: memberType,
          year: year,
          page: extra.page || 1,
          per_page: extra.per_page || pageSize,  // ✅ kirim ke server
        },
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })
      setFees(res.data.data)
      setPageMeta(res.data.meta)
    } finally {
      setLoading(false)
    }
  }

  // auto refetch saat filter berubah
  useEffect(() => {
    const t = setTimeout(() => fetchFees({ page: 1 }), 200) // debounce ringan
    return () => clearTimeout(t)
  }, [memberType, year])

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

        {/* Main */}
        <div className="flex flex-1 flex-col p-4 gap-4">
          <div className="flex flex-wrap justify-end gap-3">

            {/* Filter: Tipe anggota */}
            <Select
              value={memberType}
              onValueChange={(v) => setMemberType(v)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Tipe anggota" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua tipe</SelectItem>
                <SelectItem value="perorangan">Perorangan</SelectItem>
                <SelectItem value="institusi">Institusi</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter: Tahun */}
            <Select
              value={year}
              onValueChange={(v) => {
                if (v && v !== year) {
                  setYear(v)
                  fetchFees({ year: v, page: 1 })
                }
              }}
            >
              <SelectTrigger className="flex w-40">
                <SelectValue placeholder="Rentang waktu" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Tahun</SelectItem>
                {yearsList.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


            <Button variant="default" onClick={() => setOpen(true)} className="self-end gap-2 w-auto mx-6">
              Perbarui Nominal
            </Button>
          </div>

          <div className="flex flex-col gap-4 lg:py-2 lg:px-2 p-2 md:gap-2 md:py-4 border border-foreground/10 rounded-lg mx-6 overflow-x-auto">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-semibold">Pembaruan Nominal Iuran</h1>
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground text-center">Loading data…</p>
            )}

            {!loading && (
              <div className="px-4 lg:px-2">
                {/* <DataTable data={tableData} columns={columns} /> */}
                <DataTable
                  data={tableData}
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
                      fetchFees({ page: nextPage, per_page: pageSize })
                    }
                  }}
                  onPageSizeChange={(size) => {
                    setPageSize(size)
                    fetchFees({ page: 1, per_page: size })   // ✅ reload halaman 1 dengan limit baru
                  }}
                />
              </div>
            )}

            {/* Pagination */}
            {/* {pageMeta?.last_page > 1 && (
              <div className="flex justify-between items-center mt-4 px-4 pb-2">
                <Button
                  variant="outline"
                  disabled={pageMeta.current_page <= 1 || loading}
                  onClick={() => fetchFees({ page: pageMeta.current_page - 1 })}
                >
                  Prev
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {pageMeta.current_page} of {pageMeta.last_page} • Total {pageMeta.total}
                </span>

                <Button
                  variant="outline"
                  disabled={pageMeta.current_page >= pageMeta.last_page || loading}
                  onClick={() => fetchFees({ page: pageMeta.current_page + 1 })}
                >
                  Next
                </Button>
              </div>
            )} */}
          </div>
        </div>

        {/* Dialog Edit */}
        <FeeEditDialog open={open} onOpenChange={setOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}
