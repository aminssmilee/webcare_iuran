"use client"

import { useForm } from "@inertiajs/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          Verifikasi Email
        </h2>
        <p className="text-sm text-center mb-6 text-gray-600">
          Kami telah mengirim kode OTP ke{" "}
          <span className="font-medium text-gray-800">{data.email}</span>.
          <br />
          Silakan masukkan 6 digit kode di bawah ini.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={data.otp_code}
            onChange={(e) => setData("otp_code", e.target.value)}
            className="text-center text-lg tracking-widest"
          />

          {errors.otp_code && (
            <p className="text-red-500 text-sm text-center">
              {errors.otp_code}
            </p>
          )}

          <Button
            type="submit"
            disabled={processing}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {processing ? "Memverifikasi..." : "Verifikasi Sekarang"}
          </Button>
        </form>
      </div>
    </div>
  )
}
