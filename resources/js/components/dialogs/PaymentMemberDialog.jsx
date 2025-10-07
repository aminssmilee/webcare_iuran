"use client"
import * as React from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, Upload } from "lucide-react"
import { router } from "@inertiajs/react"

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

const toMonthIndex = (name) => MONTHS.indexOf(name) + 1 // 1..12
const toLabel = (m) => MONTHS[m - 1] || ""

// Rupiah helpers
const formatRupiah = (value) => {
  const number = String(value).replace(/\D/g, "")
  if (!number) return ""
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(parseInt(number, 10))
}
const parseRupiahToInt = (formatted) => {
  const raw = String(formatted).replace(/[^\d]/g, "")
  return raw ? parseInt(raw, 10) : 0
}

export function PaymentMemberDialog({ open, onOpenChange, children }) {
  const [selectedMonths, setSelectedMonths] = React.useState([]) // [1..12]
  const [amount, setAmount] = React.useState("") // formatted string
  const [note, setNote] = React.useState("")
  const [status, setStatus] = React.useState("Pending")
  const [statusMessage, setStatusMessage] = React.useState("")
  const [proofFile, setProofFile] = React.useState(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState({})

  const currentMonth = new Date().getMonth() + 1 // 1..12

  const handleToggleMonth = (monthName) => {
    const idx = toMonthIndex(monthName)
    setSelectedMonths((prev) =>
      prev.includes(idx) ? prev.filter((m) => m !== idx) : [...prev, idx]
    )
  }

  // === File handlers (tanpa alert, tampilkan error di bawah field) ===
  const validateFile = (file) => {
    if (!file) return { valid: false, message: "Bukti pembayaran wajib diupload." }
    const okType = /^(image\/(png|jpeg|jpg)|application\/pdf)$/i.test(file.type)
    if (!okType) return { valid: false, message: "File harus gambar (JPG/PNG) atau PDF." }
    if (file.size > 500 * 1024) return { valid: false, message: "Ukuran file maksimal 500KB." }
    return { valid: true }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    const res = validateFile(file)
    if (!res.valid) {
      setProofFile(null)
      setErrors((prev) => ({ ...prev, proof: res.message }))
      return
    }
    setErrors((prev) => ({ ...prev, proof: undefined }))
    setProofFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    const res = validateFile(file)
    if (!res.valid) {
      setProofFile(null)
      setErrors((prev) => ({ ...prev, proof: res.message }))
      return
    }
    setErrors((prev) => ({ ...prev, proof: undefined }))
    setProofFile(file)
  }

  // === Status otomatis berdasarkan pilihan bulan ===
  React.useEffect(() => {
    if (selectedMonths.length === 0) {
      setStatus("Complete your payment confirmation")
      setStatusMessage("Please select month(s) to continue.")
      return
    }
    const minIdx = Math.min(...selectedMonths)
    const maxIdx = Math.max(...selectedMonths)

    if (selectedMonths.every((m) => m === currentMonth)) {
      setStatus("On-time")
      setStatusMessage("Payment is on time for the current month.")
    } else if (selectedMonths.every((m) => m > currentMonth)) {
      setStatus("Advance Payment")
      setStatusMessage(`User is paying ${selectedMonths.length} month(s) in advance starting from ${toLabel(minIdx)}.`)
    } else if (selectedMonths.every((m) => m < currentMonth)) {
      setStatus("Late Payment")
      setStatusMessage(`User is late by ${selectedMonths.length} month(s). Last paid month was ${toLabel(maxIdx)}.`)
    } else {
      const lateCount = selectedMonths.filter((m) => m < currentMonth).length
      setStatus("Incomplete")
      setStatusMessage(`Mixed selection: ${lateCount} late month(s) and ${selectedMonths.length - lateCount} future month(s).`)
    }
  }, [selectedMonths, currentMonth])

  // Reset form ketika modal dibuka
  React.useEffect(() => {
    if (open) {
      setSelectedMonths([])
      setAmount("")
      setNote("")
      setStatus("Pending")
      setStatusMessage("")
      setProofFile(null)
      setErrors({})
    }
  }, [open])

  // === Validasi sebelum submit (tanpa alert) ===
  const validateBeforeSubmit = () => {
    const e = {}
    if (selectedMonths.length === 0) e.months = "Pilih minimal 1 bulan."
    if (!amount) e.amount = "Nominal wajib diisi."
    const num = parseRupiahToInt(amount)
    if (!e.amount && num <= 0) e.amount = "Nominal tidak valid."

    if (!proofFile) e.proof = "Bukti pembayaran wajib diupload."
    else {
      const fileCheck = validateFile(proofFile)
      if (!fileCheck.valid) e.proof = fileCheck.message
    }
    return e
  }

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    setErrors({})

    const eLocal = validateBeforeSubmit()
    if (Object.keys(eLocal).length) {
      setErrors(eLocal)
      return
    }

    setSubmitting(true)

    // Kirim FormData
    const fd = new FormData()
    selectedMonths.forEach((m) => fd.append("months[]", String(m)))
    fd.append("amount", String(parseRupiahToInt(amount))) // angka murni
    fd.append("note", note || "")
    fd.append("proof", proofFile)

    router.post("/member/payments", fd, {
      forceFormData: true,
      preserveScroll: true,
      onError: (serverErr) => {
        // Error validasi dari backend (Inertia) akan mendarat di sini
        setErrors(serverErr || {})
        setSubmitting(false)
      },
      onSuccess: () => {
        setSubmitting(false)
        onOpenChange(false)
      },
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Kalau control modal dari parent, DialogTrigger optional */}
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}

      <DialogContent className="max-w-xs lg:max-w-md rounded-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Month Period */}
          <div className="grid gap-2">
            <Label>Month Period <span className="text-red-500">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full justify-between text-sm font-normal py-2 ${errors.months ? "border-red-500" : ""}`}
                >
                  {selectedMonths.length > 0
                    ? selectedMonths.slice().sort((a,b)=>a-b).map(toLabel).join(", ")
                    : "Select months"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandGroup>
                    {MONTHS.map((month) => {
                      const idx = toMonthIndex(month)
                      const checked = selectedMonths.includes(idx)
                      return (
                        <CommandItem key={month} onSelect={() => handleToggleMonth(month)}>
                          <Check className={`mr-2 h-4 w-4 ${checked ? "opacity-100" : "opacity-0"}`} />
                          {month}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.months && <p className="text-red-500 text-xs">{errors.months}</p>}
          </div>

          {/* Amount */}
          <div className="grid gap-2">
            <Label>Amount <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(formatRupiah(e.target.value))}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
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
            <Label>Payment Proof (max 500 KB) <span className="text-red-500">*</span></Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 ${errors.proof ? "border-red-500" : ""}`}
              onClick={() => document.getElementById("payment-proof")?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-normal">
                Drag & drop image or PDF here or click to upload
              </span>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="payment-proof"
              />
            </div>
            {proofFile && <p className="text-xs text-muted-foreground">{proofFile.name}</p>}
            {errors.proof && <p className="text-red-500 text-xs">{errors.proof}</p>}
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

          <DialogFooter className="flex-col gap-2 lg:flex-row">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
