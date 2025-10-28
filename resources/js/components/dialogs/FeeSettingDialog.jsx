import { useState } from "react"
import { usePage, router } from "@inertiajs/react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function FeeEditDialog({ open, onOpenChange }) {
    const { props } = usePage()
    const { fees = [] } = props

    const [memberType, setMemberType] = useState("perorangan")
    const [tahun, setTahun] = useState(new Date().getFullYear())
    const [nominal, setNominal] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const data = Array.isArray(fees)
        ? fees.map((fee) => ({
            tahun: fee.tahun,
            member_type: fee.member_type,
            nominal_tahunan: `Rp ${Number(fee.nominal).toLocaleString("id-ID")}`,
            nominal_bulanan: `Rp ${(fee.nominal / 12).toLocaleString("id-ID")}`,
        }))
        : []

    // 🔹 Helper functions
    const formatRupiah = (value) => {
        if (!value) return ""
        return `Rp ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
    }

    const parseNumber = (str) => str.replace(/\D/g, "")


    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitting(true)

        router.post(
            "/admin/fee-settings",
            { member_type: memberType, tahun, nominal },
            {
                onSuccess: () => {
                    toast.success(" Data iuran berhasil disimpan")
                    setNominal("")
                    setSubmitting(false)
                    onOpenChange(false) //  Tutup modal setelah sukses
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Ubah Nominal Iuran</DialogTitle>
                </DialogHeader>

                {/* Form di dalam Dialog */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 mt-2"
                >
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tipe Anggota
                            </label>
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
                            <label className="block text-sm font-medium mb-1">
                                Nominal Tahunan (Rp)
                            </label>
                            <Input
                                type="text"
                                value={formatRupiah(nominal)}
                                onChange={(e) => setNominal(parseNumber(e.target.value))}
                                placeholder="Masukkan nominal tahunan"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
