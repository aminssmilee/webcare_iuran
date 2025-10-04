import { useState } from "react"
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
import { getPaymentColumns } from "@/components/data-table/table-colums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { PaymentMemberDialog } from "@/components/dialogs/PaymentMemberDialog"
import { MemberCard } from "@/components/cards/MemberCard"
import ProfileInfo from "@/components/cards/ProfileInfo"
import { LogOut } from "lucide-react"
import { route } from "ziggy-js"
import { Inertia } from "@inertiajs/inertia"


// Dummy data payments
export const paymentsData = [
  {
    id: 1,
    mount: "January",
    amount: 150000,
    dueDate: "2025-10-01 12:45",
    paidAt: "2025-10-01 10:30",
    paymentProof: "https://example.com/docs/payment1.pdf",
    note: "Bayar cicilan pertama",
    status: "Pending",
  },
  {
    id: 2,
    mount: "Februari",
    amount: 250000,
    dueDate: "2025-10-01 12:45",
    paidAt: "2025-09-30 14:20",
    paymentProof: "https://example.com/docs/payment2.pdf",
    note: "Pembayaran lengkap",
    status: "Completed",
  },
  {
    id: 3,
    mount: "Maret",
    amount: 50000,
    dueDate: "2025-10-01 12:45",
    paidAt: "2025-09-28 09:15",
    paymentProof: "", // belum upload dokumen
    note: "",
    status: "Failed",
  },
  {
    id: 4,
    mount: "April",
    amount: 120000,
    dueDate: "2025-10-01 12:45",
    paidAt: "2025-10-01 12:45",
    paymentProof: "https://example.com/docs/payment4.pdf",
    note: "Bayar sebagian",
    status: "Pending",
  },
  {
    id: 5,
    mount: "Mei",
    amount: 300000,
    dueDate: "2025-10-01 12:45",
    paidAt: "2025-09-29 16:10",
    paymentProof: "https://example.com/docs/payment5.pdf",
    note: "Bayar lunas",
    status: "Completed",
  },
  {
    id: 6,
    mount: "June",
    amount: 100000,
    dueDate: "2025-10-01 12:45",
    paidAt: "2025-09-27 11:00",
    paymentProof: "",
    note: "Belum bayar",
    status: "Pending",
  },
  {
    id: 7,
    mount: "July",
    amount: 75000,
    dueDate: "2025-10-01 12:45",
    paidAt: "2025-09-26 13:30",
    paymentProof: "https://example.com/docs/payment7.pdf",
    note: "",
    status: "Completed",
  },
  {
    id: 8,
    mount: "July",
    amount: 200000,
    dueDate: "2025-10-01 12:45",
    paidAt: "2025-09-25 10:00",
    paymentProof: "",
    note: "Perlu konfirmasi",
    status: "Failed",
  },
];

const user = {
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
};

export default function MemberPayment() {
  const [timeRange, setTimeRange] = useState("90d");
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="flex flex-1 flex-col px-6 pt-10 lg:px-18 lg:py-20 gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl lg:text-2xl font-bold ml-2">Member Information</h1>
        <Button
          variant="link"
          onClick={() => Inertia.post(route("member.logout"))}
        >
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          <MemberCard id="0129" name="Budi Santoso" job="Software Engineer" />
          <ProfileInfo
            user={user}
            onEdit={() => alert("Edit profile clicked")}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-2 flex flex-col border border-foreground/10 rounded-lg">
          {/* Header filter & search */}
          <CardHeader className="lg:px-6 w-full flex flex-col gap-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
              {/* search */}
              <div className="flex items-start justify-start gap-2 lg:w-1/3 w-full md:w-1/2">
                <div className="relative w-full">
                  <Input
                    className="h-8 w-full pl-8 border border-foreground/20 bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                    placeholder="Search by mount period"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button variant="default" className="h-8 w-20 lg:w-28 md:w-1/3">
                  Search
                </Button>
              </div>

              {/* filter */}
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger
                    className="flex w-40"
                    aria-label="Select a value"
                  >
                    <SelectValue placeholder="Last 3 months" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="90d" className="rounded-lg">
                      Last 3 months
                    </SelectItem>
                    <SelectItem value="30d" className="rounded-lg">
                      Last 30 days
                    </SelectItem>
                    <SelectItem value="7d" className="rounded-lg">
                      Last 7 days
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          {/* Payment list table */}
          <div className="flex flex-col gap-4 p-4 md:gap-2 md:py-2">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-xl font-semibold">Payment List</h1>
              <PaymentMemberDialog open={openDialog} onOpenChange={setOpenDialog}>
                <Button
                  variant="secondary"
                  className="text-sm font-normal text-foreground hover:text-foreground/80 self-end"
                >
                  Pay This Month
                </Button>
              </PaymentMemberDialog>
            </div>
            <div className="px-4 lg:px-2">
              <DataTable data={paymentsData} columns={getPaymentColumns()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}