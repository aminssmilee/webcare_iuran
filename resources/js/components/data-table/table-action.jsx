"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
// import { useRouter } from "next/navigation"
import { EditUserDialog } from "@/components/dialogs/EditUserDialog"
import  { DeleteUserDialog }  from "@/components/dialogs/DeleteUserDialog"
import  { RejectReasonDialog }  from "@/components/dialogs/RejectReasonDialog"
import  { PaymentActionDialog }  from "@/components/dialogs/PaymentActionDialog"


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
          <DropdownMenuItem onClick={() => alert(`Approved ${user.name}`)}>Approve</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenReject(true)}>Reject</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RejectReasonDialog target={user} open={openReject} onOpenChange={setOpenReject} />
    </>
  )
}

// -------------------------
//  Payment Validation Actions
// -------------------------
export function PaymentValidationActionsCell({ payment }) {
  const [openReason, setOpenReason] = useState(false)
  const [actionType, setActionType] = useState("")

  const handleAction = (type) => {
    if(type === "Approve"){
      alert(`Payment ${payment.id} Approved`)
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

      <PaymentActionDialog payment={payment} action={actionType} open={openReason} onOpenChange={setOpenReason} />
    </>
  )
}
