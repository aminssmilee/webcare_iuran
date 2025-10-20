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
  //  ✅ Fungsi Approve (lama, tetap dipakai)
  // ======================
  const handleApprove = () => {
    console.log("🟢 handleApprove dijalankan untuk:", user)

    Inertia.post(`/admin/registrations/${user.id}/approve`, {}, {
      preserveScroll: true,
      preserveState: false, // 🚨 WAJIB false supaya flash props dikirim ulang
      onSuccess: (page) => {
        console.log("🟢 onSuccess:", page.props)
        const flash = page.props.flash
        if (flash?.success) {
          alert(flash.success)
        } else if (flash?.error) {
          alert(flash.error)
        } else {
          alert("✅ Proses selesai tanpa pesan flash")
        }
      },
      onError: (err) => {
        console.error("🔴 onError:", err)
        alert("Terjadi kesalahan saat approve.")
      },
    })
  }

  // ======================
  //  ✅ Fungsi Reject (diperbaiki + tambahan log)
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

  // 🔹 Fungsi utama untuk handle aksi menu
  const handleAction = (type) => {
    if (type === "Approve") {
      if (confirm(`Setujui pembayaran ${payment.name}?`)) {
        Inertia.post(`/admin/payment-validation/${payment.id}/approve`, {}, {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => console.log(`✅ Payment ${payment.id} approved`),
          onError: (err) => console.error("Approve gagal:", err),
        })
      }
    } else {
      // untuk Reject, Overpaid, Expired → minta alasan
      setActionType(type)
      setOpenReason(true)
    }
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
          <DropdownMenuItem onClick={() => handleAction("Approve")}>
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Reject")}>
            Reject
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Overpaid")}>
            Overpaid
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Expired")}>
            Expired
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal alasan (Reject, Overpaid, Expired) */}
      <PaymentActionDialog
        payment={payment}
        action={actionType}
        open={openReason}
        onOpenChange={setOpenReason}
      />
    </>
  )

}
