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
import { Check, Upload, X, Trash, File } from "lucide-react"
import { router, usePage } from "@inertiajs/react"

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const toMonthIndex = (name) => MONTHS.indexOf(name) + 1
const toLabel = (m) => MONTHS[m - 1] || ""

const formatRupiah = (value) => {
  const number = String(value).replace(/\D/g, "")
  if (!number) return ""
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(parseInt(number, 10))
}

const parseRupiahToInt = (formatted) => {
  const raw = String(formatted).replace(/[^\d]/g, "")
  return raw ? parseInt(raw, 10) : 0
}

export function PaymentMemberDialog({ open, onOpenChange, children }) {
  const { paidMonths = [] } = usePage().props

  const [selectedMonths, setSelectedMonths] = React.useState([])
  const [amount, setAmount] = React.useState("")
  const [note, setNote] = React.useState("")
  const [status, setStatus] = React.useState("Menunggu")
  const [statusMessage, setStatusMessage] = React.useState("")
  const [proofFile, setProofFile] = React.useState(null)
  const [fileName, setFileName] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState({})

  const fileInputRef = React.useRef(null)
  const currentMonth = new Date().getMonth() + 1

  // =======================================================
  // 🧩 Pilih Bulan
  // =======================================================
  const handleToggleMonth = (monthName) => {
    const idx = toMonthIndex(monthName)
    if (paidMonths.includes(idx)) return
    setSelectedMonths((prev) =>
      prev.includes(idx) ? prev.filter((m) => m !== idx) : [...prev, idx]
    )
  }

  // =======================================================
  // 📎 Validasi File
  // =======================================================
  const validateFile = (file) => {
    if (!file) return { valid: false, message: "Bukti pembayaran wajib diunggah." }
    const okType = /^(image\/(png|jpeg|jpg)|application\/pdf)$/i.test(file.type)
    if (!okType) return { valid: false, message: "File harus berupa gambar (JPG/PNG) atau PDF." }
    if (file.size > 500 * 1024) return { valid: false, message: "Ukuran file maksimal 500KB." }
    return { valid: true }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    const res = validateFile(file)
    if (!res.valid) {
      setProofFile(null)
      setFileName("")
      setErrors((prev) => ({ ...prev, proof: res.message }))
      return
    }
    setErrors((prev) => ({ ...prev, proof: undefined }))
    setProofFile(file)
    setFileName(file.name)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    const res = validateFile(file)
    if (!res.valid) {
      setProofFile(null)
      setFileName("")
      setErrors((prev) => ({ ...prev, proof: res.message }))
      return
    }
    setErrors((prev) => ({ ...prev, proof: undefined }))
    setProofFile(file)
    setFileName(file.name)
  }

  const handleRemoveFile = () => {
    setProofFile(null)
    setFileName("")
  }

  // =======================================================
  // 🔄 Status Otomatis Berdasarkan Bulan
  // =======================================================
  React.useEffect(() => {
    if (selectedMonths.length === 0) {
      setStatus("Lengkapi konfirmasi pembayaran")
      setStatusMessage("Silakan pilih bulan terlebih dahulu.")
      return
    }

    const minIdx = Math.min(...selectedMonths)
    const maxIdx = Math.max(...selectedMonths)

    if (selectedMonths.every((m) => m === currentMonth)) {
      setStatus("Tepat Waktu")
      setStatusMessage("Pembayaran tepat waktu untuk bulan ini.")
    } else if (selectedMonths.every((m) => m > currentMonth)) {
      setStatus("Pembayaran di Muka")
      setStatusMessage(
        `Anda membayar ${selectedMonths.length} bulan ke depan mulai ${toLabel(minIdx)}.`
      )
    } else if (selectedMonths.every((m) => m < currentMonth)) {
      setStatus("Terlambat")
      setStatusMessage(
        `Pembayaran terlambat ${selectedMonths.length} bulan. Terakhir dibayar bulan ${toLabel(maxIdx)}.`
      )
    } else {
      const lateCount = selectedMonths.filter((m) => m < currentMonth).length
      setStatus("Campuran")
      setStatusMessage(
        `Terdapat ${lateCount} bulan terlambat dan ${
          selectedMonths.length - lateCount
        } bulan di depan.`
      )
    }
  }, [selectedMonths, currentMonth])

  React.useEffect(() => {
    if (open) {
      setSelectedMonths([])
      setAmount("")
      setNote("")
      setStatus("Menunggu")
      setStatusMessage("")
      setProofFile(null)
      setFileName("")
      setErrors({})
    }
  }, [open])

  // =======================================================
  // ✅ Validasi Sebelum Submit
  // =======================================================
  const validateBeforeSubmit = () => {
    const e = {}
    if (selectedMonths.length === 0) e.months = "Pilih minimal 1 bulan."
    if (!amount) e.amount = "Nominal wajib diisi."
    const num = parseRupiahToInt(amount)
    if (!e.amount && num <= 0) e.amount = "Nominal tidak valid."
    if (!proofFile) e.proof = "Bukti pembayaran wajib diunggah."
    else {
      const fileCheck = validateFile(proofFile)
      if (!fileCheck.valid) e.proof = fileCheck.message
    }
    return e
  }

  // =======================================================
  // 🚀 Kirim Data ke Server
  // =======================================================
  const handleSubmit = (e) => {
    e?.preventDefault?.()
    setErrors({})
    const eLocal = validateBeforeSubmit()
    if (Object.keys(eLocal).length) {
      setErrors(eLocal)
      return
    }
    setSubmitting(true)
    const fd = new FormData()
    selectedMonths.forEach((m) => fd.append("months[]", String(m)))
    fd.append("amount", String(parseRupiahToInt(amount)))
    fd.append("note", note || "")
    fd.append("proof", proofFile)
    router.post("/member/payments", fd, {
      forceFormData: true,
      preserveScroll: true,
      onError: (serverErr) => {
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

  // =======================================================
  // 🖼️ Tampilan UI
  // =======================================================
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}

      <DialogContent className="max-w-xs lg:max-w-md rounded-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Tambah Pembayaran Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Pilihan Bulan */}
          <div className="grid gap-2">
            <Label>
              Periode Bulan <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full justify-between text-sm font-normal py-2 ${
                    errors.months ? "border-red-500" : ""
                  }`}
                >
                  {selectedMonths.length > 0
                    ? selectedMonths
                        .slice()
                        .sort((a, b) => a - b)
                        .map(toLabel)
                        .join(", ")
                    : "Pilih bulan pembayaran"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandGroup>
                    {MONTHS.map((month) => {
                      const idx = toMonthIndex(month)
                      const checked = selectedMonths.includes(idx)
                      const alreadyPaid = paidMonths.includes(idx)
                      return (
                        <CommandItem
                          key={month}
                          onSelect={() => {
                            if (!alreadyPaid) handleToggleMonth(month)
                          }}
                          className={`flex items-center justify-between ${
                            alreadyPaid
                              ? "pointer-events-none opacity-50 select-none"
                              : "cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center">
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                alreadyPaid
                                  ? "opacity-100 text-green-600"
                                  : checked
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {month}
                          </div>
                          {alreadyPaid && (
                            <span className="text-[11px] text-green-600 italic">Sudah Dibayar</span>
                          )}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.months && <p className="text-red-500 text-xs">{errors.months}</p>}
          </div>

          {/* Nominal */}
          <div className="grid gap-2">
            <Label>
              Nominal Pembayaran <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Masukkan nominal pembayaran"
              value={amount}
              onChange={(e) => setAmount(formatRupiah(e.target.value))}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
          </div>

          {/* Catatan */}
          <div className="grid gap-2">
            <Label>Catatan</Label>
            <Textarea
              placeholder="Tambahkan catatan (opsional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Bukti Pembayaran */}
          <div className="grid gap-2">
            <Label>
              Bukti Pembayaran (maks. 500 KB) <span className="text-red-500">*</span>
            </Label>
            {!proofFile ? (
              <div
                className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 ${
                  errors.proof ? "border-red-500" : ""
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-normal">
                  Seret & lepaskan gambar atau PDF di sini, atau klik untuk unggah
                </span>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative flex flex-col items-start justify-between rounded-lg border px-4 py-3">
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="self-end top-2 right-2 rounded-full px-1 py-1 transition"
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </button>
                <div className="flex flex-row items-center gap-2">
                  <File className="h-4 w-4 text-green-700" />
                  <span className="text-sm text-green-700">{fileName}</span>
                </div>
              </div>
            )}
            {errors.proof && <p className="text-sm text-red-500">{errors.proof}</p>}
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label>Status Pembayaran</Label>
            <div
              className={`p-2 rounded-md text-sm font-medium ${
                status === "Tepat Waktu"
                  ? "bg-green-100 text-green-700"
                  : status === "Pembayaran di Muka"
                  ? "bg-blue-100 text-blue-700"
                  : status === "Terlambat"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {status}
            </div>
            <p className="text-xs text-muted-foreground">{statusMessage}</p>
          </div>

          {/* Tombol */}
          <DialogFooter className="flex-col gap-2 lg:flex-row">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
