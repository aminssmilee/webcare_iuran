"use client"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { router } from "@inertiajs/react"

export function EditProfileDialog({ open, onOpenChange, member, user }) {
  const [data, setData] = useState({
    name: "",
    nik: "",
    tgl_lahir: "",
    jenis_kelamin: "",
    alamat: "",
    no_wa: "",
    pendidikan: "",
    pekerjaan: "",
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Prefill saat modal dibuka
  useEffect(() => {
    if (!open) {
      // bersihkan error ketika modal ditutup
      setErrors({})
      return
    }
    const tgl = member?.tgl_lahir ? String(member.tgl_lahir).slice(0, 10) : ""
    setData({
      name: user?.name || "",
      nik: member?.nik || "",
      tgl_lahir: tgl,
      jenis_kelamin: member?.jenis_kelamin || "",
      alamat: member?.alamat || "",
      no_wa: member?.no_wa || "",
      pendidikan: member?.pendidikan || "",
      pekerjaan: member?.pekerjaan || "",
    })
  }, [open, user, member])

  function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    const eLocal = {}

    if (!data.name) eLocal.name = "Nama wajib diisi."
    if (!data.nik) eLocal.nik = "NIK wajib diisi."
    else if (!/^[0-9]{16}$/.test(data.nik)) eLocal.nik = "NIK harus 16 digit."
    if (!data.tgl_lahir) eLocal.tgl_lahir = "Tanggal lahir wajib diisi."
    if (!data.jenis_kelamin) eLocal.jenis_kelamin = "Jenis kelamin wajib dipilih."
    if (!data.alamat) eLocal.alamat = "Alamat wajib diisi."
    if (!data.no_wa) eLocal.no_wa = "Nomor WhatsApp wajib diisi."
    else if (!/^08[0-9]{8,13}$/.test(data.no_wa)) eLocal.no_wa = "Nomor WhatsApp tidak valid."
    if (!data.pendidikan) eLocal.pendidikan = "Pendidikan wajib diisi."
    if (!data.pekerjaan) eLocal.pekerjaan = "Pekerjaan wajib diisi."

    if (Object.keys(eLocal).length) {
      setErrors(eLocal)
      const firstKey = Object.keys(eLocal)[0]
      e.currentTarget.querySelector(`[name="${firstKey}"]`)?.focus()
      return
    }

    setSubmitting(true)

    router.post("/member/profile/update", data, {
      preserveScroll: true,
      onError: (serverErrors) => {
        // error validasi dari backend (Inertia) ditampilkan di bawah field
        setErrors(serverErrors || {})
        setSubmitting(false)
      },
      onSuccess: () => {
        setSubmitting(false)
        onOpenChange(false) // tutup modal
        // opsi: reload sebagian props kalau perlu:
        router.reload({ only: ["member", "user"] })
      },
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nama */}
          <div>
            <Label>Nama Lengkap</Label>
            <Input
              name="name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* NIK */}
          <div>
            <Label>NIK</Label>
            <Input
              name="nik"
              value={data.nik}
              onChange={(e) => {
                // hanya izinkan mengetik jika NIK sebelumnya kosong
                if (!member?.nik) {
                  setData({ ...data, nik: e.target.value })
                }
              }}
              placeholder="Masukkan NIK"
              readOnly={!!member?.nik} // kalau sudah ada → kunci input
              className={`${member?.nik
                  ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  : "bg-white dark:bg-gray-900"
                } ${errors.nik ? "border-red-500" : ""}`}
            />
            {member?.nik ? (
              <p className="text-xs text-muted-foreground">
                NIK sudah terisi dan tidak dapat diubah.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Masukkan NIK Anda (16 digit).
              </p>
            )}
            {errors.nik && <p className="text-red-500 text-sm">{errors.nik}</p>}
          </div>

          {/* <div>
            <Label>NIK</Label>
            <Input
              name="nik"
              value={data.nik}
              readOnly
              className={`bg-gray-100 dark:bg-gray-800 cursor-not-allowed ${errors.nik ? "border-red-500" : ""
                }`}
            />
            {errors.nik && <p className="text-red-500 text-sm">{errors.nik}</p>}
          </div> */}

          {/* Tanggal Lahir */}
          <div>
            <Label>Tanggal Lahir</Label>
            <Input
              type="date"
              name="tgl_lahir"
              value={data.tgl_lahir}
              onChange={(e) => setData({ ...data, tgl_lahir: e.target.value })}
              className={errors.tgl_lahir ? "border-red-500" : ""}
            />
            {errors.tgl_lahir && <p className="text-red-500 text-sm">{errors.tgl_lahir}</p>}
          </div>

          {/* Jenis Kelamin */}
          <div>
            <Label>Jenis Kelamin</Label>
            <Select
              value={data.jenis_kelamin}
              onValueChange={(val) => setData({ ...data, jenis_kelamin: val })}
            >
              <SelectTrigger className={errors.jenis_kelamin ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            {errors.jenis_kelamin && (
              <p className="text-red-500 text-sm">{errors.jenis_kelamin}</p>
            )}
          </div>

          {/* Alamat */}
          <div>
            <Label>Alamat</Label>
            <Input
              name="alamat"
              value={data.alamat}
              onChange={(e) => setData({ ...data, alamat: e.target.value })}
              className={errors.alamat ? "border-red-500" : ""}
            />
            {errors.alamat && <p className="text-red-500 text-sm">{errors.alamat}</p>}
          </div>

          {/* No WhatsApp */}
          <div>
            <Label>No WhatsApp</Label>
            <Input
              name="no_wa"
              value={data.no_wa}
              onChange={(e) => setData({ ...data, no_wa: e.target.value })}
              className={errors.no_wa ? "border-red-500" : ""}
            />
            {errors.no_wa && <p className="text-red-500 text-sm">{errors.no_wa}</p>}
          </div>

          {/* Pendidikan */}
          <div>
            <Label>Pendidikan</Label>
            <Select
              value={data.pendidikan}
              onValueChange={(val) => setData({ ...data, pendidikan: val })}
            >
              <SelectTrigger className={errors.pendidikan ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih pendidikan terakhir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SD">SD</SelectItem>
                <SelectItem value="SMP">SMP</SelectItem>
                <SelectItem value="SMA/SMK">SMA / SMK</SelectItem>
                <SelectItem value="D3">D3</SelectItem>
                <SelectItem value="S1">S1</SelectItem>
                <SelectItem value="S2">S2</SelectItem>
                <SelectItem value="S3">S3</SelectItem>
              </SelectContent>
            </Select>
            {errors.pendidikan && <p className="text-red-500 text-sm">{errors.pendidikan}</p>}
          </div>

          {/* Pekerjaan */}
          <div>
            <Label>Pekerjaan</Label>
            <Input
              name="pekerjaan"
              value={data.pekerjaan}
              onChange={(e) => setData({ ...data, pekerjaan: e.target.value })}
              className={errors.pekerjaan ? "border-red-500" : ""}
            />
            {errors.pekerjaan && <p className="text-red-500 text-sm">{errors.pekerjaan}</p>}
          </div>

          <DialogFooter className="mt-6 flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
