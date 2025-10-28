"use client"

import { useForm } from "@inertiajs/react"

import { GalleryVerticalEnd } from "lucide-react"
import { OTPForm } from "@/components/otp-form"
import Image from "/public/img/collaborative-process-multicultural-businesspeople-using-laptop-presentation-communication-meeting-brainstorming-ideas-about-project-colleagues-working-plan-success-strategy-modern-office.jpg"


export default function OtpVerification({ email }) {
  const { data, setData, post, processing, errors } = useForm({
    email: email || "",
    otp_code: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    post("/verify-otp")
  }

  return (

    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-xs flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <img
            src="/img/1-asosiasi-teknik-sistem-energi-indonesia.png"
              // alt={activeTeam.name}
              className="size-8 object-contain"
            />
          FORSINERGI
        </a>
        <OTPForm email={data.email} />
      </div>
    </div>
  )
}
