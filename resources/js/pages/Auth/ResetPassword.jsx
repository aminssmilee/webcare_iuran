"use client"
import { useState } from "react"
import { router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "/public/img/aerial-view-novel-white-marble-table.jpg"

export default function ResetPassword({ token, email: initialEmail }) {
  const [form, setForm] = useState({
    email: initialEmail || "",
    password: "",
    password_confirmation: "",
    token,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    router.post("/member/reset-password", form, {
      onError: (err) => {
        setErrors(err)
        setLoading(false)
      },
      onSuccess: () => {
        setLoading(false)
        alert("✅ Password berhasil diubah. Silakan login kembali.")
        router.visit("/member/login")
      },
    })
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
              Reset Password
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div>
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div>
                <Label>Konfirmasi Password</Label>
                <Input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password_confirmation: e.target.value,
                    })
                  }
                  className={errors.password_confirmation ? "border-red-500" : ""}
                />
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm">
                    {errors.password_confirmation}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>
            </form>

            <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-300">
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
