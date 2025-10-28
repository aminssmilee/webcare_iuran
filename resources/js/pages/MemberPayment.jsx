"use client"

import { useState, useEffect } from "react"
import { Inertia } from "@inertiajs/inertia"
import { usePage } from "@inertiajs/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { DataTable } from "@/components/data-table/DataTable"
import { getPaymentColumns } from "@/components/data-table/table-colums"
import { Search, LogOut } from "lucide-react"
import { CardHeader } from "@/components/ui/card"
import { MemberCard } from "@/components/cards/MemberCard"
import ProfileInfo from "@/components/cards/ProfileInfo"
import { EditProfileDialog } from "@/components/dialogs/EditProfileDialog"
import { PaymentWrapper } from "@/components/paymentWrapper"
import { MemberAnnouncement } from "@/components/MemberAnnouncement"

export default function MemberPayment() {
  const { props } = usePage()
  const { user, member, payments, profileComplete, announcements } = props

  const [query, setQuery] = useState("")
  const [timeRange, setTimeRange] = useState("90d")
  const [filteredPayments, setFilteredPayments] = useState(payments || [])
  const [loggingOut, setLoggingOut] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)

  useEffect(() => {
    if (!payments) return
    const q = query.trim().toLowerCase()
    let filtered = payments
    if (q !== "") {
      filtered = filtered.filter(
        (p) =>
          (p.mount && p.mount.toLowerCase().includes(q)) ||
          (p.amount && p.amount.toLowerCase().includes(q)) ||
          (p.dueDate && p.dueDate.toLowerCase().includes(q))
      )
    }
    setFilteredPayments(filtered)
  }, [query, payments])

  function handleLogout() {
    setLoggingOut(true)
    Inertia.post("/member/logout", {}, { onFinish: () => setLoggingOut(false) })
  }

  return (
    <div className="flex flex-1 flex-col p-4 sm:px-6 lg:px-10 xl:px-20 pt-10 lg:pt-16 gap-6">
      {/* 🔹 Header */}
      <div className="flex flex-row flex-wrap items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold ml-0 sm:ml-2">
          Informasi Anggota
        </h1>

        <Button
          variant="link"
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-green-600 hover:text-red-700 whitespace-nowrap"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {loggingOut ? "Memproses..." : "Keluar"}
        </Button>
      </div>

      {/* 🔹 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* 🟩 Kolom Kiri (Card, Pengumuman, Profil) */}
        <div className="flex flex-col gap-6 order-1 lg:order-1">
          <MemberCard
            id={member?.id || "-"}
            name={user?.name || "-"}
            job={member?.pekerjaan || "-"}
            role={user?.role || "-"}
          />
          <MemberAnnouncement announcements={announcements} />
          <ProfileInfo
            user={user}
            member={member}
            onEdit={() => setOpenEdit(true)}
          />
        </div>

        {/* 🟦 Kolom Kanan (Tabel Pembayaran) */}
        <div className="col-span-2 order-2 lg:order-2 flex flex-col border border-foreground/10 rounded-lg overflow-hidden">
          <CardHeader className="lg:px-6 w-full flex flex-col gap-4 border-b p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
              {/* 🔍 Input Search */}
              <div className="w-full md:w-1/2 relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 w-full pl-9 border border-foreground/20 bg-background shadow-sm hover:bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary transition-all"
                  placeholder="Cari di sini..."
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              {/* ⏳ Filter Waktu */}
              <div className="flex justify-start md:justify-end w-full md:w-auto">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="3 bulan terakhir" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="90d">3 bulan terakhir</SelectItem>
                    <SelectItem value="30d">30 hari terakhir</SelectItem>
                    <SelectItem value="7d">7 hari terakhir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          {/* 📋 Table Section */}
          <div className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <h1 className="text-lg sm:text-xl font-semibold">Daftar Pembayaran</h1>
              <PaymentWrapper profileComplete={profileComplete} />
            </div>

            {/* 📱 Table Scrollable di Mobile */}
            <div className="overflow-x-auto rounded-lg border border-border/10 bg-background/30">
              <DataTable data={filteredPayments} columns={getPaymentColumns()} />
            </div>
          </div>
        </div>
      </div>

      {/* ✏️ Dialog Edit Profil */}
      <EditProfileDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        member={member}
        user={user}
      />
    </div>
  )
}
