"use client"
import { useState } from "react"
import { router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GalleryVerticalEnd } from "lucide-react"
import Image from "/public/img/aerial-view-novel-white-marble-table.jpg"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setStatus("")

    router.post(
      "/member/forgot-password",
      { email },
      {
        onSuccess: (page) => {
          setStatus(
            page.props.flash?.status ||
              "Link reset password telah dikirim ke email Anda."
          )
          setLoading(false)
        },
        onError: (err) => {
          setErrors(err)
          setLoading(false)
        },
      }
    )
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Kiri: form reset password */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <img
              src="/img/1-asosiasi-teknik-sistem-energi-indonesia.png"
              alt="Logo FORSINERGI"
              className="size-8 object-contain"
            />
            <span className="font-semibold tracking-wide">FORSINERGI</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
              Lupa Password
            </h1>

            {status && (
              <p className="mb-4 text-green-600 text-sm text-center">{status}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="Masukkan email terdaftar"
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </Button>
            </form>

            <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-300">
              Sudah ingat password?{" "}
              <a
                href="/member/login"
                className="text-blue-600 hover:underline"
              >
                Kembali ke Login
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Kanan: gambar background */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src={Image}
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
