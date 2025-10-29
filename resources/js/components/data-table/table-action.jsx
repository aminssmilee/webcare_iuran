"use client"
import { useState } from "react"
import { Inertia } from "@inertiajs/inertia"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"


// Dialogs
import { EditUserDialog } from "@/components/dialogs/EditUserDialog"
import { DeleteUserDialog } from "@/components/dialogs/DeleteUserDialog"
import { RejectReasonDialog } from "@/components/dialogs/RejectReasonDialog"
import { PaymentActionDialog } from "@/components/dialogs/PaymentActionDialog"
import { FeeEditDialog } from "@/components/dialogs/FeeSettingDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { router } from "@inertiajs/react"
// import { FeeEditDialog } from "@/components/dialogs/FeeSettingDialog"


//
// -------------------------
//  User Actions
// -------------------------
export function UserActionsCell({ user }) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 border-2 rounded-lg">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog user={user} open={openEdit} onOpenChange={setOpenEdit} />
      <DeleteUserDialog user={user} open={openDelete} onOpenChange={setOpenDelete} />
    </>
  )
}

// -------------------------
//  Registration Validation Actions
// -------------------------
export function RegistrationValidationActionsCell({ user }) {
  const [openReject, setOpenReject] = useState(false)

  // ======================
  //   Fungsi Approve (lama, tetap dipakai)
  // ======================
  const handleApprove = () => {
    console.log(" handleApprove dijalankan untuk:", user)

    Inertia.post(`/admin/registrations/${user.id}/approve`, {}, {
      preserveScroll: true,
      preserveState: false, //  WAJIB false supaya flash props dikirim ulang
      onSuccess: (page) => {
        console.log(" onSuccess:", page.props)
        const flash = page.props.flash
        if (flash?.success) {
          alert(flash.success)
        } else if (flash?.error) {
          alert(flash.error)
        } else {
          alert("Proses selesai tanpa pesan flash")
        }
      },
      onError: (err) => {
        console.error(" onError:", err)
        alert("Terjadi kesalahan saat approve.")
      },
    })
  }

  // ======================
  //  Fungsi Reject (diperbaiki + tambahan log)
  // ======================
  const handleReject = (reason) => {
    console.log("🚀 handleReject dipanggil. Reason:", reason)
    console.log("Target user:", user)

    Inertia.post(`/admin/registrations/${user.id}/reject`, { reason }, {
      preserveScroll: true,
      preserveState: false, // refresh props biar flash dikirim
      onSuccess: (page) => {
        console.log("✅ Reject success:", page.props)
        const flash = page.props.flash
        if (flash?.success) {
          alert(flash.success)
        } else if (flash?.error) {
          alert(flash.error)
        } else {
          alert(`❌ ${user.name} berhasil ditolak.`)
        }
      },
      onError: (err) => {
        console.error("Reject gagal:", err)
        alert("Gagal menolak user.")
      },
    })
  }

  // ======================
  //  ✅ UI Dropdown Menu (tidak dihapus)
  // ======================
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 border-2 rounded-lg">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleApprove}>Approve</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenReject(true)}>Reject</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ====================== */}
      {/* ✅ Dialog alasan Reject */}
      {/* ====================== */}
      <RejectReasonDialog
        target={user}
        open={openReject}
        onOpenChange={setOpenReject}
        onReject={handleReject}
      />
    </>
  )
}
//
// -------------------------
//  Payment Validation Actions
// -------------------------
export function PaymentValidationActionsCell({ payment }) {
  const [openReason, setOpenReason] = useState(false)
  const [actionType, setActionType] = useState("")
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successDialog, setSuccessDialog] = useState(false)
  const [errorDialog, setErrorDialog] = useState(false)
  const [rejectSuccessDialog, setRejectSuccessDialog] = useState(false) // 🆕 tambahan


  // 🔹 Handle dropdown menu
  const handleAction = (type) => {
    if (type === "Approve") {
      setConfirmApprove(true)
    } else {
      setActionType(type)
      setOpenReason(true)
    }
  }

  // 🔹 Approve request (pakai axios biar gak reload halaman)
  const handleApprove = async () => {
    setLoading(true)
    try {
      await axios.post(`/admin/payment-validation/${payment.id}/approve`, {}, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })

      toast.success("Pembayaran berhasil disetujui!", {
        style: { background: "#dcfce7", color: "#166534", fontWeight: 600 },
        duration: 2500,
      })

      setConfirmApprove(false)
      setTimeout(() => setSuccessDialog(true), 200)

      // 🔁 Trigger event agar tabel di-refresh
      window.dispatchEvent(new CustomEvent("payment-updated"))
    } catch (err) {
      console.error("Gagal approve:", err)
      toast.error("Gagal menyetujui pembayaran!", {
        style: { background: "#fee2e2", color: "#991b1b", fontWeight: 600 },
        duration: 2500,
      })
      setTimeout(() => setErrorDialog(true), 200)
    } finally {
      setLoading(false)
    }
  }
  // 🔹 Reject request (pakai axios biar gak reload halaman)
  const handleReject = async (reason) => {
    if (!reason) {
      toast.error("Alasan penolakan wajib diisi.", {
        style: { background: "#fee2e2", color: "#991b1b", fontWeight: 600 },
        duration: 2500,
      })
      return
    }

    setLoading(true)
    try {
      await axios.post(`/admin/payment-validation/${payment.id}/reject`, { reason }, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })

      toast.error("❌ Pembayaran berhasil ditolak!", {
        style: { background: "#fee2e2", color: "#991b1b", fontWeight: 600 },
        duration: 2500,
      })

      setOpenReason(false)
      setTimeout(() => setRejectSuccessDialog(true), 200) // 🆕 ini ganti
      window.dispatchEvent(new CustomEvent("payment-updated"))
    } catch (err) {
      console.error("❌ Gagal reject:", err)
      toast.error("Gagal menolak pembayaran!", {
        style: { background: "#fee2e2", color: "#991b1b", fontWeight: 600 },
        duration: 2500,
      })
      setTimeout(() => setErrorDialog(true), 200)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 🔹 Dropdown menu aksi */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 border rounded-lg hover:bg-muted"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleAction("Approve")}>
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Reject")}>
            Reject
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 🔹 Dialog alasan reject */}
      <PaymentActionDialog
        payment={payment}
        action={actionType}
        open={openReason}
        onOpenChange={setOpenReason}
        onSubmit={handleReject}
      />

      {/* 🔹 Dialog konfirmasi approve */}
      <Dialog open={confirmApprove} onOpenChange={setConfirmApprove}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setujui Pembayaran</DialogTitle>
            <DialogDescription>
              Yakin ingin menyetujui pembayaran{" "}
              <span className="font-semibold text-foreground">{payment.name}</span>{" "}
              sebesar{" "}
              <b>
                Rp{" "}
                {parseFloat(String(payment.amount ?? 0).replace(/[^\d]/g, ""))
                  .toLocaleString("id-ID")}
              </b>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmApprove(false)} disabled={loading}>
              Batal
            </Button>
            <Button onClick={handleApprove} disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Menyetujui...
                </div>
              ) : (
                "Setujui"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🔹 Dialog sukses */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran Disetujui 🎉</DialogTitle>
            <DialogDescription>
              Pembayaran <b>{payment.name}</b> berhasil disetujui!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setSuccessDialog(false)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🔹 Dialog gagal */}
      <Dialog open={errorDialog} onOpenChange={setErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gagal Menyetujui</DialogTitle>
            <DialogDescription>
              Terjadi kesalahan saat menyetujui pembayaran. Silakan coba lagi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setErrorDialog(false)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🔹 Dialog sukses REJECT */}
      <Dialog open={rejectSuccessDialog} onOpenChange={setRejectSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran Ditolak</DialogTitle>
            <DialogDescription>
              Pembayaran <b>{payment.name}</b> telah berhasil ditolak.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="destructive" onClick={() => setRejectSuccessDialog(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}


// -------------------------
//  Fee Setting Actions
// -------------------------  
export function FeeSettingActionsCell({ payment }) {
  const [openDelete, setOpenDelete] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = (e) => {
    e.preventDefault()
    setLoading(true)
    console.log("🧹 Mulai hapus:", payment.id)

    router.delete(`/admin/fee-settings/${payment.id}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        console.log("✅ Sukses hapus:", payment.id)
        toast.success(`Data iuran ${payment.tahun} — ${payment.member_type} berhasil dihapus!`)
        window.dispatchEvent(new CustomEvent("fee-updated"))
        setOpenDelete(false)
        setLoading(false)
      },
      onError: (err) => {
        console.error("❌ Error hapus:", err)
        toast.error("Gagal menghapus data iuran.")
        setLoading(false)
      },
      onFinish: () => {
        console.log("🧩 onFinish called")
        setLoading(false)
      },
    })
  }


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 border rounded-lg hover:bg-muted"
          >
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>Hapus</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Edit */}
      <FeeEditDialog payment={payment} open={openEdit} onOpenChange={setOpenEdit} />

      {/* Dialog Hapus */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin hapus data iuran <b>{payment.tahun}</b> — <b>{payment.member_type}</b>?
          </p>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}