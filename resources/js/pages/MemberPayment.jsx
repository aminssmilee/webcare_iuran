import { useState, useEffect } from "react"
import { Inertia } from "@inertiajs/inertia"
import { usePage } from "@inertiajs/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { DataTable } from "@/components/data-table/DataTable"
import { getPaymentColumns } from "@/components/data-table/table-colums"
import { Search, LogOut } from "lucide-react"
import { CardHeader } from "@/components/ui/card"
import { MemberCard } from "@/components/cards/MemberCard"
import ProfileInfo from "@/components/cards/ProfileInfo"
import { EditProfileDialog } from "@/components/dialogs/EditProfileDialog"
import { PaymentWrapper } from "@/components/paymentWrapper"

export default function MemberPayment() {
  const { props } = usePage()
  const { user, member, payments, profileComplete } = props

  // console.log("Payments dari Laravel:", payments)
  const [query, setQuery] = useState("")
  const [timeRange, setTimeRange] = useState("90d")
  const [filteredPayments, setFilteredPayments] = useState(payments || [])
  const [loggingOut, setLoggingOut] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)

  // 🔍 Filter client-side
  useEffect(() => {
  if (!payments) return

  const q = query.trim().toLowerCase()
  let filtered = payments

  // 🔍 Fitur pencarian
  if (q !== "") {
    filtered = filtered.filter(p =>
      (p.month && p.month.toLowerCase().includes(q)) ||
      (p.amount && p.amount.toLowerCase().includes(q)) ||
      (p.dueDate && p.dueDate.toLowerCase().includes(q))
    )
  }

  // 🔄 Filter by range (7d, 30d, 90d) – opsional
  if (timeRange) {
    const now = new Date()
    const cutoff = new Date()
    if (timeRange === "7d") cutoff.setDate(now.getDate() - 7)
    if (timeRange === "30d") cutoff.setDate(now.getDate() - 30)
    if (timeRange === "90d") cutoff.setDate(now.getDate() - 90)

    // NOTE: kalau tidak ada field `created_at`, skip aja bagian ini
    // filtered = filtered.filter(p => new Date(p.created_at) >= cutoff)
  }

  setFilteredPayments(filtered)
}, [query, timeRange, payments])



  // 🔄 Logout handler
  function handleLogout() {
    setLoggingOut(true)
    Inertia.post("/member/logout", {}, { onFinish: () => setLoggingOut(false) })
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-10 lg:px-18 lg:py-20 gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl lg:text-2xl font-bold ml-2">Member Information</h1>
        <Button variant="link" onClick={handleLogout} disabled={loggingOut}>
          <LogOut className="h-4 w-4 mr-2" />
          {loggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          <MemberCard id={member?.id || "-"} name={user?.name || "-"} job={member?.pekerjaan || "-"} />
          <ProfileInfo user={user} member={member} onEdit={() => setOpenEdit(true)} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-2 flex flex-col border border-foreground/10 rounded-lg">
          <CardHeader className="lg:px-6 w-full flex flex-col gap-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
              <div className="flex items-start justify-start gap-2 lg:w-1/3 w-full md:w-1/2">
                <div className="relative w-full">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                    placeholder="Cari disini..."
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="flex w-40" aria-label="Select a value">
                    <SelectValue placeholder="Last 3 months" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <div className="flex flex-col gap-4 p-4 md:gap-2 md:py-2">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-semibold">Payment List</h1>
              <PaymentWrapper profileComplete={profileComplete} />
            </div>

            <div className="px-4 lg:px-2">
              <DataTable data={filteredPayments} columns={getPaymentColumns()} />
            </div>
          </div>
        </div>
      </div>

      <EditProfileDialog open={openEdit} onOpenChange={setOpenEdit} member={member} user={user} />
    </div>
  )
}
