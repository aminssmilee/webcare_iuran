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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function FeeSettings() {
  const { props } = usePage()
  const { fees = [] } = props

  const [memberType, setMemberType] = useState("perorangan")
  const [tahun, setTahun] = useState(new Date().getFullYear())
  const [nominal, setNominal] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)

    router.post("/admin/fee-settings", 
      { member_type: memberType, tahun, nominal },
      {
        onSuccess: () => {
          toast.success("✅ Data iuran berhasil disimpan")
          setNominal("")
          setSubmitting(false)
          router.reload({ only: ["fees"] })
        },
        onError: () => {
          toast.error("Gagal menyimpan data, periksa input Anda.")
          setSubmitting(false)
        },
      }
    )
  }

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

        {/* Content */}
        <div className="flex flex-col flex-1 p-6 space-y-6">
          <CardHeader className="pb-0">
            <h1 className="text-2xl font-semibold text-gray-800">Pengaturan Besaran Iuran</h1>
            <p className="text-sm text-muted-foreground">
              Admin dapat menyesuaikan nominal iuran tahunan untuk setiap tipe anggota dan tahun.
            </p>
          </CardHeader>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border rounded-xl shadow-sm p-6 space-y-4"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipe Anggota</label>
                <Select value={memberType} onValueChange={setMemberType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe anggota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perorangan">Perorangan</SelectItem>
                    <SelectItem value="institusi">Institusi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tahun</label>
                <Input
                  type="number"
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full"
                  min="2020"
                  max="2100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nominal Tahunan (Rp)</label>
                <Input
                  type="number"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  placeholder="Masukkan nominal tahunan"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </div>
          </form>

          {/* Table Data */}
          <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Tahun</th>
                  <th className="p-3 text-left">Tipe Member</th>
                  <th className="p-3 text-left">Nominal Tahunan</th>
                  <th className="p-3 text-left">Nominal Bulanan</th>
                </tr>
              </thead>
              <tbody>
                {fees.length > 0 ? (
                  fees.map((fee, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50 transition">
                      <td className="p-3">{fee.tahun}</td>
                      <td className="p-3 capitalize">{fee.member_type}</td>
                      <td className="p-3 font-medium">
                        Rp {Number(fee.nominal).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 text-gray-600">
                        Rp {(fee.nominal / 12).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 p-4">
                      Belum ada data iuran tersimpan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
