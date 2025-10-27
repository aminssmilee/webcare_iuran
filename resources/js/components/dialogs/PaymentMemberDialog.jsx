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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem, CommandSeparator } from "@/components/ui/command"
import { Check, Upload, Trash, File, Loader2, CheckCircle2 } from "lucide-react"
import { router, usePage } from "@inertiajs/react"
import { ScrollDialogContent } from "@/components/ui/scroll-dialog-content"

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const toMonthIndex = (name) => MONTHS.indexOf(name) + 1
const toLabel = (m) => MONTHS[m - 1] || ""

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)

export function PaymentMemberDialog({ open, onOpenChange, children }) {
  const { fee = {}, paidMonths: rawPaidMonths } = usePage().props
  const paidMonths = Array.isArray(rawPaidMonths) ? rawPaidMonths : []

  const baseFee = fee?.nominal_tahunan || 0
  const perMonth = fee?.nominal_per_bulan || Math.floor(baseFee / 12)

  const [selectedMonths, setSelectedMonths] = React.useState([])
  const [note, setNote] = React.useState("")
  const [proofFile, setProofFile] = React.useState(null)
  const [fileName, setFileName] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const fileInputRef = React.useRef(null)

  const [loadingModal, setLoadingModal] = React.useState(false)
  const [successModal, setSuccessModal] = React.useState(false)

  const totalToPay = selectedMonths.length * perMonth
  const currentMonth = new Date().getMonth() + 1

  // =======================================================
  // 🔄 Status Otomatis Berdasarkan Bulan yang Dipilih
  // =======================================================
  const [status, setStatus] = React.useState("Belum Bayar")
  const [statusMessage, setStatusMessage] = React.useState("Belum ada pembayaran yang dilakukan.")

  React.useEffect(() => {
    if (selectedMonths.length === 0) {
      setStatus("Belum Bayar")
      setStatusMessage("Silakan pilih periode pembayaran.")
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
        `Terdapat ${lateCount} bulan terlambat dan ${selectedMonths.length - lateCount
        } bulan di depan.`
      )
    }
  }, [selectedMonths, currentMonth])

  // =======================================================
  // 📎 Validasi File
  // =======================================================
  const validateFile = (file) => {
    if (!file) return { valid: false, message: "Bukti pembayaran wajib diunggah." }
    const okType = /^(image\/(png|jpeg|jpg)|application\/pdf)$/i.test(file.type)
    if (!okType) return { valid: false, message: "File harus berupa JPG/PNG atau PDF." }
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
  // 🔘 Pilih Bulan
  // =======================================================
  const handleToggleMonth = (monthName) => {
    const idx = toMonthIndex(monthName)
    if (paidMonths.includes(idx)) return
    setSelectedMonths((prev) =>
      prev.includes(idx) ? prev.filter((m) => m !== idx) : [...prev, idx]
    )
  }

  const handleToggleAllMonths = () => {
    if (selectedMonths.length === 12) {
      setSelectedMonths([])
    } else {
      setSelectedMonths(Array.from({ length: 12 }, (_, i) => i + 1))
    }
  }

  // =======================================================
  // 🚀 Submit
  // =======================================================
  // const handleSubmit = (e) => {
  //   e.preventDefault()
  //   const eLocal = {}
  //   if (selectedMonths.length === 0) eLocal.months = "Pilih minimal 1 bulan."
  //   if (!proofFile) eLocal.proof = "Bukti pembayaran wajib diunggah."
  //   if (Object.keys(eLocal).length) {
  //     setErrors(eLocal)
  //     return
  //   }

  //   setSubmitting(true)
  //   const fd = new FormData()
  //   selectedMonths.forEach((m) => fd.append("months[]", String(m)))
  //   fd.append("note", note || "")
  //   fd.append("proof", proofFile)

  //   router.post("/member/payments", fd, {
  //     forceFormData: true,
  //     preserveScroll: true,
  //     onError: (serverErr) => {
  //       setErrors(serverErr || {})
  //       setSubmitting(false)
  //     },
  //     onSuccess: () => {
  //       setSubmitting(false)
  //       onOpenChange(false)
  //       router.reload({ only: ["paidMonths"] }) // reload daftar bulan yang sudah dibayar
  //     },
  //     onFinish: () => setSubmitting(false),
  //   })
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const eLocal = {}
    if (selectedMonths.length === 0) eLocal.months = "Pilih minimal 1 bulan."
    if (!proofFile) eLocal.proof = "Bukti pembayaran wajib diunggah."
    if (Object.keys(eLocal).length) {
      setErrors(eLocal)
      return
    }

    setSubmitting(true)
    setLoadingModal(true) // tampilkan modal loading

    const fd = new FormData()
    selectedMonths.forEach((m) => fd.append("months[]", String(m)))
    fd.append("note", note || "")
    fd.append("proof", proofFile)

    router.post("/member/payments", fd, {
      forceFormData: true,
      preserveScroll: true,

      onError: (serverErr) => {
        setErrors(serverErr || {})
        setSubmitting(false)
        setLoadingModal(false)
      },

      onSuccess: () => {
        // simulasi loading 2 detik, lalu tampilkan modal sukses
        setTimeout(() => {
          setLoadingModal(false)
          setSuccessModal(true)

          // otomatis tutup modal sukses setelah 2,5 detik
          setTimeout(() => {
            setSuccessModal(false)
            onOpenChange(false) // tutup dialog utama
            router.reload({ only: ["paidMonths", "payments"] })
          }, 2500)
        }, 1500)
      },

      onFinish: () => setSubmitting(false),
    })
  }

  // =======================================================
  // 🎨 UI
  // =======================================================
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}

      <ScrollDialogContent>
        <DialogHeader>
          <DialogTitle>Bayar Iuran Tahun {new Date().getFullYear()}</DialogTitle>
        </DialogHeader>

        {!fee ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            Data iuran belum diatur oleh admin.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {/* Periode Pembayaran */}
            <div className="grid gap-2">
              <Label>
                Periode Pembayaran <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full justify-start text-sm font-normal py-2 whitespace-normal break-words text-left ${errors.months ? "border-red-500" : ""
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
                      <CommandItem
                        onSelect={handleToggleAllMonths}
                        className="flex items-center justify-between cursor-pointer bg-muted/50"
                      >
                        <div className="flex items-center">
                          <Check
                            className={`mr-2 h-4 w-4 ${selectedMonths.length === 12
                              ? "opacity-100 text-green-600"
                              : "opacity-0"
                              }`}
                          />
                          {selectedMonths.length === 12
                            ? "Batalkan Semua Bulan"
                            : "Pilih Semua Bulan"}
                        </div>
                      </CommandItem>

                      <CommandSeparator />

                      {/* {MONTHS.map((month) => {
                        const idx = toMonthIndex(month)
                        const checked = selectedMonths.includes(idx)
                        const alreadyPaid = paidMonths.includes(idx)
                        return (
                          <CommandItem
                            key={month}
                            onSelect={() => {
                              if (!alreadyPaid) handleToggleMonth(month)
                            }}
                            className={`flex items-center justify-between ${alreadyPaid
                                ? "pointer-events-none opacity-50 select-none"
                                : "cursor-pointer"
                              }`}
                          >
                            <div className="flex items-center">
                              <Check
                                className={`mr-2 h-4 w-4 ${checked ? "opacity-100 text-green-600" : "opacity-0"
                                  }`}
                              />
                              {month}
                            </div>
                            {alreadyPaid && (
                              <span className="text-[11px] text-green-600 italic">
                                Sudah Dibayar
                              </span>
                            )}
                          </CommandItem>
                        )
                      })} */}

                      {MONTHS.map((month) => {
                        const idx = toMonthIndex(month)
                        const checked = selectedMonths.includes(idx)
                        const alreadyPaid = (paidMonths || []).includes(idx)

                        return (
                          <CommandItem
                            key={month}
                            onSelect={() => {
                              if (!alreadyPaid) handleToggleMonth(month)
                            }}
                            className={`flex items-center justify-between ${alreadyPaid
                              ? "bg-muted/30 text-green-700 pointer-events-none select-none"
                              : "cursor-pointer"
                              }`}
                          >
                            <div className="flex items-center">
                              <Check
                                className={`mr-2 h-4 w-4 ${checked || alreadyPaid
                                  ? "opacity-100 text-green-600"
                                  : "opacity-0"
                                  }`}
                              />
                              {month}
                            </div>
                            {alreadyPaid && (
                              <span className="text-[11px] text-green-600 italic font-medium">
                                Sudah Dibayar
                              </span>
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
              <Label>Nominal Pembayaran Otomatis</Label>
              <Input
                type="text"
                readOnly
                value={formatRupiah(totalToPay || 0)}
                className="bg-gray-100 font-semibold text-green-700"
              />
              <p className="text-xs text-muted-foreground">
                Total iuran tahunan: {formatRupiah(baseFee)} | per bulan: {formatRupiah(perMonth)}
              </p>
            </div>

            {/* Catatan */}
            <div className="grid gap-2">
              <Label>Catatan (opsional)</Label>
              <Textarea
                placeholder="Tambahkan catatan..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Bukti Pembayaran */}
            <div className="grid gap-2">
              <Label>
                Bukti Pembayaran <span className="text-red-500">*</span>
              </Label>
              {!proofFile ? (
                <div
                  className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 ${errors.proof ? "border-red-500" : ""
                    }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-normal">
                    Seret & lepaskan gambar/PDF di sini, atau klik untuk unggah
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

            {/* Status Pembayaran */}
            <div className="grid gap-2">
              <Label>Status Pembayaran</Label>
              <div
                className={`p-2 rounded-md text-sm font-medium ${status === "Tepat Waktu"
                  ? "bg-green-100 text-green-700"
                  : status === "Pembayaran di Muka"
                    ? "bg-blue-100 text-blue-700"
                    : status === "Terlambat"
                      ? "bg-yellow-100 text-yellow-700"
                      : status === "Campuran"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
              >
                {status}
              </div>
              <p className="text-xs text-muted-foreground">{statusMessage}</p>
            </div>

            {/* Tombol */}
            <DialogFooter className="flex-col gap-2 lg:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Bayar Sekarang"}
              </Button>
            </DialogFooter>

            {/* 🔄 Modal Loading */}
            <Dialog open={loadingModal} onOpenChange={setLoadingModal}>
              <DialogContent className="sm:max-w-[350px] text-center py-8 animate-fade-in">
                <DialogHeader>
                  <DialogTitle className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
                    <span className="text-lg font-semibold text-blue-700">
                      Memproses Pembayaran...
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Mohon tunggu, sistem sedang memproses pembayaran Anda.
                </p>
              </DialogContent>
            </Dialog>

            {/* ✅ Modal Sukses */}
            <Dialog open={successModal} onOpenChange={setSuccessModal}>
              <DialogContent className="sm:max-w-[400px] text-center py-8 animate-fade-in">
                <DialogHeader>
                  <DialogTitle className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full border-4 border-green-200 flex items-center justify-center">
                      <CheckCircle2 className="text-green-500 w-10 h-10 animate-bounce" />
                    </div>
                    <span className="text-xl font-semibold text-green-700">
                      Pembayaran Berhasil 🎉
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Bukti pembayaran berhasil dikirim. Tunggu konfirmasi dari admin.
                </p>
              </DialogContent>
            </Dialog>
          </form>
        )}
      </ScrollDialogContent>
    </Dialog>
  )
}
