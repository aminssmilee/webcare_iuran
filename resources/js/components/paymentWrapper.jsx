"use client"
import * as React from "react"
import { usePage } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { PaymentMemberDialog } from "@/components/dialogs/PaymentMemberDialog"
import { EditProfileDialog } from "@/components/dialogs/EditProfileDialog"
import { toast } from "sonner"

export function PaymentWrapper({ profileComplete }) {
  const { props } = usePage()
  const user = props.auth?.user || {}
  const member = props.member || null
  const payments = props.payments || [] // ✅ tambahkan

  // ambil semua bulan yang sudah dibayar dari data
  const paidMonths = payments.map(p => p.month_number || p.month || null).filter(Boolean)

  const [openPayment, setOpenPayment] = React.useState(false)
  const [openProfile, setOpenProfile] = React.useState(false)

  const handleOpenPayment = () => {
    if (!member || !member.id) {
      toast.error("Lengkapi profil Anda terlebih dahulu sebelum membayar.")
      setOpenProfile(true)
      return
    }
    setOpenPayment(true)
  }

  return (
    <>
      <Button
        variant={profileComplete ? "secondary" : "outline"}
        className={`text-sm font-normal self-end ${
          !profileComplete ? "opacity-70 hover:opacity-90" : ""
        }`}
        onClick={handleOpenPayment}
      >
        Pay This Month
      </Button>

      {/* ✅ kirim paidMonths ke dialog */}
      <PaymentMemberDialog
        open={openPayment}
        onOpenChange={setOpenPayment}
        paidMonths={paidMonths}
      />

      <EditProfileDialog
        open={openProfile}
        onOpenChange={setOpenProfile}
        user={user}
        member={member}
      />
    </>
  )
}
