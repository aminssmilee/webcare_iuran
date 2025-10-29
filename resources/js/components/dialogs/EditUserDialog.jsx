"use client"
import { useState, useEffect } from "react"
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
import { toast } from "sonner"
// import { router } from "@inertiajs/react"


export function EditUserDialog({ user, open, onOpenChange }) {
  const [data, setData] = useState({
    name: "",
    email: "",
    member_type: "",
    nik: "",
    ttl: "",
    jenis_kelamin: "",
    alamat: "",
    no_wa: "",
    pendidikan: "",
    jabatan: "",
    status: "",
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Prefill form ketika modal dibuka
  useEffect(() => {
    if (open && user) {
      setData({
        name: user.name || "",
        email: user.email || "",
        member_type: user.member_type || "",
        nik: user.nik || "",
        ttl: user.birthPlaceDate || "", // sesuai controller
        jenis_kelamin:
          user.gender === "Male"
            ? "L"
            : user.gender === "Female"
              ? "P"
              : "",
        alamat: user.address || "",
        no_wa: user.whatsapp || "",
        pendidikan: user.education || "",
        jabatan: user.occupation || "",
        status: user.status?.toLowerCase() || "active",
      })
      setErrors({})
    }
  }, [open, user])

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    router.put(`/admin/users/${user.id}`, data, {
      preserveScroll: true,

      onSuccess: (page) => {
        setLoading(false)
        onOpenChange(false)

        // ✅ tampilkan alert sukses
        toast.success("Data user berhasil diperbarui!", {
          style: { background: "#dcfce7", color: "#166534", fontWeight: 600 },
          duration: 2500,
        })

        // ✅ reload data tabel di halaman ManageUsers tanpa full reload
        // router.reload({ only: ["users"] })
        // window.dispatchEvent(new Event("user-updated"))
        window.dispatchEvent(
          new CustomEvent("user-updated-instant", { detail: { id: user.id, data } })
        )
      },

      onError: (err) => {
        setErrors(err)
        setLoading(false)
        toast.error("Gagal memperbarui data. Periksa input Anda.", {
          style: { background: "#fee2e2", color: "#991b1b", fontWeight: 600 },
          duration: 2500,
        })
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nama */}
          <div>
            <Label>Nama</Label>
            <Input
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Type Anggota */}
          {/* <div>
            <Label>Type Anggota</Label>
            <Select
              value={data.member_type}
              onValueChange={(val) => setData({ ...data, member_type: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe anggota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perorangan">Perorangan</SelectItem>
                <SelectItem value="institution">Institution</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* NIK */}
          <div>
            <Label>NIK</Label>
            <Input
              value={data.nik}
              onChange={(e) => setData({ ...data, nik: e.target.value })}
            />
          </div>

          {/* TTL */}
          {/* <div>
            <Label>Tempat / Tanggal Lahir</Label>
            <Input
              value={data.ttl}
              onChange={(e) => setData({ ...data, ttl: e.target.value })}
            />
          </div> */}

          {/* Jenis Kelamin */}
          {/* <div>
            <Label>Jenis Kelamin</Label>
            <Select
              value={data.jenis_kelamin}
              onValueChange={(val) => setData({ ...data, jenis_kelamin: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Alamat */}
          <div>
            <Label>Alamat</Label>
            <Input
              value={data.alamat}
              onChange={(e) => setData({ ...data, alamat: e.target.value })}
            />
          </div>

          {/* No WhatsApp */}
          <div>
            <Label>No WhatsApp</Label>
            <Input
              value={data.no_wa}
              onChange={(e) => setData({ ...data, no_wa: e.target.value })}
            />
          </div>

          {/* Pendidikan */}
          {/* <div>
            <Label>Pendidikan Terakhir</Label>
            <Input
              value={data.pendidikan}
              onChange={(e) => setData({ ...data, pendidikan: e.target.value })}
            />
          </div> */}

          {/* Jabatan */}
          <div>
            <Label>Jabatan</Label>
            <Input
              value={data.jabatan}
              onChange={(e) => setData({ ...data, jabatan: e.target.value })}
            />
          </div>

          {/* Status */}
          {/* <div>
            <Label>Status</Label>
            <Select
              value={data.status}
              onValueChange={(val) => setData({ ...data, status: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          <DialogFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
