"use client"
import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, Upload } from "lucide-react"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

// 🔹 helper format rupiah
const formatRupiah = (value) => {
  const number = value.replace(/\D/g, "")
  if (!number) return ""
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(parseInt(number, 10))
}

export function PaymentMemberDialog({ open, onOpenChange, children }) {
  // ✅ versi aman untuk JSX (tanpa generic)
  const [selectedMonths, setSelectedMonths] = React.useState([])
  const [amount, setAmount] = React.useState("")
  const [note, setNote] = React.useState("")
  const [status, setStatus] = React.useState("Pending")
  const [statusMessage, setStatusMessage] = React.useState("")
  const [proofFile, setProofFile] = React.useState(null)

  const currentMonthIndex = new Date().getMonth()

  const handleToggleMonth = (month) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    )
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.size > 500 * 1024) {
      alert("File size must be less than 500 KB")
      e.target.value = ""
      return
    }
    setProofFile(file || null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.size > 500 * 1024) {
      alert("File size must be less than 500 KB")
      return
    }
    setProofFile(file)
  }

  const handleSubmit = () => {
    console.log("New Payment:", {
      selectedMonths,
      amount,
      note,
      status,
      proofFile,
      paidAt: new Date().toISOString(),
    })
    onOpenChange(false)
  }

  // logic status berdasarkan bulan
  React.useEffect(() => {
    if (selectedMonths.length === 0) {
      setStatus("Complete your payment confirmation")
      setStatusMessage("Please select month(s) to continue.")
      return
    }

    const indexes = selectedMonths.map((m) => MONTHS.indexOf(m))
    const minIdx = Math.min(...indexes)
    const maxIdx = Math.max(...indexes)

    if (indexes.every((i) => i === currentMonthIndex)) {
      setStatus("On-time")
      setStatusMessage("Payment is on time for the current month.")
    } else if (indexes.every((i) => i > currentMonthIndex)) {
      setStatus("Advance Payment")
      setStatusMessage(
        `User is paying ${indexes.length} month(s) in advance starting from ${MONTHS[minIdx]}.`
      )
    } else if (indexes.every((i) => i < currentMonthIndex)) {
      const lateMonths = indexes.filter((i) => i < currentMonthIndex)
      const lateCount = lateMonths.length
      setStatus("Late Payment")
      setStatusMessage(
        `User is late by ${lateCount} month(s). Last paid month was ${MONTHS[maxIdx]}.`
      )
    } else {
      const lateMonths = indexes.filter((i) => i < currentMonthIndex)
      const lateCount = lateMonths.length
      setStatus("Incomplete")
      setStatusMessage(
        `Mixed selection: ${lateCount} late month(s) and ${indexes.length - lateCount} future month(s).`
      )
    }
  }, [selectedMonths, currentMonthIndex])

  // reset form on open
  React.useEffect(() => {
    if (open) {
      setSelectedMonths([])
      setAmount("")
      setNote("")
      setStatus("Pending")
      setStatusMessage("")
      setProofFile(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-xs lg:max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Month Period */}
          <div className="grid gap-2">
            <Label>
              Month Period <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-sm font-normal py-2"
                >
                  {selectedMonths.length > 0
                    ? selectedMonths.join(", ")
                    : "Select months"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandGroup>
                    {MONTHS.map((month) => (
                      <CommandItem
                        key={month}
                        onSelect={() => handleToggleMonth(month)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${selectedMonths.includes(month)
                            ? "opacity-100"
                            : "opacity-0"
                            }`}
                        />
                        {month}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Amount */}
          <div className="grid gap-2">
            <Label>
              Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(formatRupiah(e.target.value))}
            />
          </div>

          {/* Note */}
          <div className="grid gap-2">
            <Label>Note</Label>
            <Textarea
              placeholder="Optional note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Payment Proof */}
          <div className="grid gap-2">
            <Label>
              Payment Proof (max 500 KB) <span className="text-red-500">*</span>
            </Label>
            <div
              className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30"
              onClick={() => document.getElementById("payment-proof")?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-normal">
                Drag & drop image or file here or click to upload
              </span>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="payment-proof"
              />
            </div>
            {proofFile && (
              <p className="text-xs text-muted-foreground">{proofFile.name}</p>
            )}
          </div>

          {/* Status (auto) */}
          <div className="grid gap-2">
            <Label>Status</Label>
            <div
              className={`p-2 rounded-md text-sm font-medium
                ${status === "On-time" ? "bg-green-100 text-green-700" :
                  status === "Advance Payment" ? "bg-blue-100 text-blue-700" :
                    status === "Late Payment" ? "bg-yellow-100 text-yellow-700" :
                      status === "Incomplete" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"}`}
            >
              {status}
            </div>
            <p className="text-xs text-muted-foreground">{statusMessage}</p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 lg:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedMonths.length || !amount || !proofFile}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
