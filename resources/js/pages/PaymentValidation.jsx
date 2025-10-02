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
import { getPaymentValidationColumns } from "@/components/data-table/table-colums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { set } from "zod"


// Dummy data payments
export const paymentsData = [
    {
        id: 1,
        name: "Budi Santoso",
        email: "budi@example.com",
        idNumber: "1234567890",
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
        name: "Budi Santoso",
        email: "budi@example.com",
        idNumber: "1234567890",
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
        name: "Budi Santoso",
        email: "budi@example.com",
        idNumber: "1234567890",
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
        name: "Budi Santoso",
        email: "budi@example.com",
        idNumber: "1234567890",
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
        name: "Budi Santoso",
        email: "budi@example.com",
        idNumber: "1234567890",
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
        name: "Budi Santoso",
        email: "budi@example.com",
        idNumber: "1234567890",
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
        name: "Budi Santoso",
        email: "budi@example.com",
        idNumber: "1234567890",
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
        name: "Budi Santoso",
        email: "budi@example.com",
        idNumber: "1234567890",
        mount: "July",
        amount: 200000,
        dueDate: "2025-10-01 12:45",
        paidAt: "2025-09-25 10:00",
        paymentProof: "",
        note: "Perlu konfirmasi",
        status: "Failed",
    },
];

export default function PaymentValidation() {
    const [timeRange, setTimeRange] = useState("90d");
    const [status, setStatus] = useState("Pending");

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
                                    <BreadcrumbLink href="/payment-validation">
                                        Member Payment Validation
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
                        <div className="flex items-center justify-between gap-2 lg:pl-6 flex-col lg:flex-row">
                            {/* search */}
                            <div className="flex items-start justify-start gap-2 lg:w-1/3 w-full md:w-1/2 -ml-6">
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

                            <div className="flex items-center gap-2">
                                {/* status */}
                                <div className="flex self-end gap-2 ">
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className=" flex w-40" aria-label="Select a value">
                                            <SelectValue placeholder="Pending" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Pending" className="rounded-lg">Pending</SelectItem>
                                            <SelectItem value="Completed" className="rounded-lg">Completed</SelectItem>
                                            <SelectItem value="Failed" className="rounded-lg">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex self-end gap-2 ">
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
                            </div>
                        </div>
                    </CardHeader>

                    <div className="flex flex-col gap-4 lg:py-2 lg:px-2 p-2 md:gap-2 md:py-4 border border-foreground/10 rounded-lg mx-6">
                        <h1 className="text-xl font-semibold m-4">Payment Members List</h1>

                        <div className="px-4 lg:px-4">
                            {/* Wrapper overflow hanya untuk tabel */}
                            <div className="w-full lg:overflow-x-auto max-w-full">
                                <DataTable data={paymentsData} columns={getPaymentValidationColumns()} />
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset >
        </SidebarProvider >
    )
}