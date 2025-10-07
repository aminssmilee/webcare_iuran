import { useState } from "react"
import { CardHeader } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { DataTable } from "@/components/data-table/DataTable"
import { getPaymentColumns } from "@/components/data-table/table-colums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, LogOut } from "lucide-react"
// import { PaymentMemberDialog } from "@/components/dialogs/PaymentMemberDialog"
import { MemberCard } from "@/components/cards/MemberCard"
import ProfileInfo from "@/components/cards/ProfileInfo"
import { Inertia } from "@inertiajs/inertia"
import { usePage } from "@inertiajs/react"
import { toast } from "sonner"
import { EditProfileDialog } from "@/components/dialogs/EditProfileDialog"
// import {PaymentWrapper} from "@/components/paymentWrapper"


export default function MemberPayment() {
  const [timeRange, setTimeRange] = useState("90d")
  const [openDialog, setOpenDialog] = useState(false)
  const { props } = usePage()
  const { user, member, payments, profileComplete } = props
  const [openEdit, setOpenEdit] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);


  function handleLogout() {
    setLoggingOut(true);
    Inertia.post("/member/logout", {}, {
      onFinish: () => setLoggingOut(false),
    });
  };


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

          <ProfileInfo
            user={props.user}
            member={props.user.member}
            onEdit={() => setOpenEdit(true)}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-2 flex flex-col border border-foreground/10 rounded-lg">
          <CardHeader className="lg:px-6 w-full flex flex-col gap-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
              <div className="flex items-start justify-start gap-2 lg:w-1/3 w-full md:w-1/2">
                <div className="relative w-full">
                  <Input
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                    placeholder="Search by mount period"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button variant="default" className="h-8 w-20 lg:w-28 md:w-1/3">Search</Button>
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

          {/* Payment Table */}
          <div className="flex flex-col gap-4 p-4 md:gap-2 md:py-2">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-semibold">Payment List</h1>
              {/* <PaymentMemberDialog open={openDialog} onOpenChange={setOpenDialog}>
                <Button
                  variant={profileComplete ? "secondary" : "outline"}
                  className={`text-sm font-normal self-end ${!profileComplete ? "opacity-70 hover:opacity-90" : ""
                    }`}
                  onClick={() => {
                    if (!profileComplete) {
                      alert("Lengkapi profil Anda terlebih dahulu sebelum membayar.")
                      toast.error("Lengkapi profil Anda terlebih dahulu sebelum membayar.")
                      // atau pakai alert:
                      // alert("Lengkapi profil Anda terlebih dahulu sebelum membayar.")
                      return
                    }
                    setOpenDialog(true)
                  }}
                >
                  Pay This Month
                </Button>
              </PaymentMemberDialog> */}
              <PaymentWrapper profileComplete={profileComplete} />
            </div>

            <div className="px-4 lg:px-2">
              <DataTable data={payments || []} columns={getPaymentColumns()} />
            </div>
          </div>
        </div>
      </div>
      <EditProfileDialog open={openEdit} onOpenChange={setOpenEdit} member={member} user={user} />
    </div>
  )
}
