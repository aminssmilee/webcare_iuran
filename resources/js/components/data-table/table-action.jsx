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

//
// -------------------------
//  Registration Validation Actions
// -------------------------
export function RegistrationValidationActionsCell({ user }) {
  const [openReject, setOpenReject] = useState(false)

  const handleApprove = () => {
    Inertia.post(`/admin/registrations/${user.id}/approve`, {}, {
      onSuccess: () => {
        console.log(`✅ Approved ${user.name}`)
      },
      onError: (err) => {
        console.error("Approve gagal:", err)
      }
    })
  }

  const handleReject = (reason) => {
    Inertia.post(`/admin/registrations/${user.id}/reject`, { reason }, {
      onSuccess: () => {
        console.log(`❌ Rejected ${user.name} dengan alasan: ${reason}`)
      },
      onError: (err) => {
        console.error("Reject gagal:", err)
      }
    })
  }

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

      {/* Dialog alasan Reject */}
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

  const handleAction = (type) => {
    if (type === "Approve") {
      Inertia.post(`/admin/payments/${payment.id}/approve`, {}, {
        onSuccess: () => {
          console.log(`✅ Payment ${payment.id} Approved`)
        },
        onError: (err) => {
          console.error("Approve payment gagal:", err)
        }
      })
    } else {
      setActionType(type)
      setOpenReason(true)
    }
  }

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
          <DropdownMenuItem onClick={() => handleAction("Approve")}>Approve</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Reject")}>Reject</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Overpaid")}>Overpaid</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Expired")}>Expired</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog alasan untuk reject / overpaid / expired */}
      <PaymentActionDialog
        payment={payment}
        action={actionType}
        open={openReason}
        onOpenChange={setOpenReason}
      />
    </>
  )
}
