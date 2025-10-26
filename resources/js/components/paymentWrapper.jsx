"use client"
import * as React from "react"
import { usePage } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentMemberDialog } from "@/components/dialogs/PaymentMemberDialog"
import { EditProfileDialog } from "@/components/dialogs/EditProfileDialog"
import { toast } from "sonner"
import Confetti from "react-confetti"
import { CheckCircle2 } from "lucide-react"

export function PaymentWrapper({ profileComplete }) {
  const { props } = usePage()
  const user = props.auth?.user || {}
  const member = props.member || null
  const paidMonths = props.paidMonths || [] // dari backend
  const allPaid = paidMonths.length >= 12

  const [openPayment, setOpenPayment] = React.useState(false)
  const [openProfile, setOpenProfile] = React.useState(false)
  const [showLunasModal, setShowLunasModal] = React.useState(false)
  const [showConfetti, setShowConfetti] = React.useState(false)

  // ✨ ketika tombol diklik
  const handleOpenPayment = () => {
    if (!member || !member.id) {
      toast.error("Lengkapi profil Anda terlebih dahulu sebelum membayar.")
      setOpenProfile(true)
      return
    }

    if (allPaid) {
      // ✅ kalau sudah lunas, tampilkan modal lunas
      setShowLunasModal(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
      return
    }

    // ✅ kalau belum lunas, buka form pembayaran
    setOpenPayment(true)
  }

  return (
    <>
      {/* Tombol utama */}
      <Button
        variant={profileComplete ? "secondary" : "outline"}
        className={`text-sm font-normal self-end ${
          !profileComplete ? "opacity-70 hover:opacity-90" : ""
        }`}
        onClick={handleOpenPayment}
      >
        Pay This Month
      </Button>

      {/* Modal pembayaran */}
      <PaymentMemberDialog
        open={openPayment}
        onOpenChange={setOpenPayment}
        paidMonths={paidMonths}
      />

      {/* Modal profil */}
      <EditProfileDialog
        open={openProfile}
        onOpenChange={setOpenProfile}
        user={user}
        member={member}
      />

      {/* ✅ Modal lunas */}
      <Dialog open={showLunasModal} onOpenChange={setShowLunasModal}>
        <DialogContent className="sm:max-w-[400px] text-center py-6">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center justify-center gap-3">
              <CheckCircle2 className="text-green-500 w-14 h-14 animate-bounce" />
              <span className="text-xl font-semibold text-green-700">
                Pembayaran Lunas 🎉
              </span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Selamat! Anda telah melunasi seluruh iuran untuk tahun ini.
          </p>
          <Button
            onClick={() => setShowLunasModal(false)}
            className="mt-5 bg-green-600 hover:bg-green-700 text-white"
          >
            Tutup
          </Button>
        </DialogContent>
      </Dialog>

      {/* Efek confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
        />
      )}
    </>
  )
}
