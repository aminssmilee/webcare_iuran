"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "@inertiajs/react"
import { Eye, EyeOff } from "lucide-react";
import RoleUserRegister from "@/components/dialogs/RoleUser";

export function LoginForm({ className, ...props }) {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
  })

  const [open, setOpen] = useState(false);

  const [localErrors, setLocalErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false);


  function validateBeforeSubmit() {
    const e = {}
    if (!data.email) e.email = "Email wajib diisi."
    else if (!/^\S+@\S+\.\S+$/.test(data.email)) e.email = "Format email tidak valid."

    if (!data.password) e.password = "Password wajib diisi."
    else if (data.password.length < 6) e.password = "Password minimal 6 karakter."

    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLocalErrors({})

    const localErr = validateBeforeSubmit()
    if (Object.keys(localErr).length > 0) {
      setLocalErrors(localErr)
      return
    }

    post("/member/login", {
      preserveScroll: true,
    })
  }

  const errClass = (key) =>
    localErrors[key] || errors[key] ? "border-red-500 focus-visible:ring-red-500" : ""

  return (
    <>
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Masuk ke akun Anda</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Masukkan email Anda di bawah ini
          </p>
        </div>

        <div className="grid gap-6">
          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contoh@example.com"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              className={errClass("email")}
            />
            {(localErrors.email || errors.email) && (
              <p className="text-sm text-red-500">{localErrors.email || errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Kata Sandi *</Label>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  className={errClass("password") + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {(localErrors.password || errors.password) && (
                <p className="text-sm text-red-500">
                  {localErrors.password || errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={processing}>
            {processing ? "Sedang masuk..." : "Masuk"}
          </Button>
        </div>

        {/* Global error */}
        {errors.auth && (
          <p className="text-center text-sm text-red-500 mt-2">{errors.auth}</p>
        )}

        <div className="text-center text-sm space-y-1">
          <div className="text-center text-sm text-muted-foreground">
            Lupa kata sandi?{" "}
            <a
              href="/member/forgot-password"
              className="underline underline-offset-4 hover:text-primary"
            >
              Atur ulang di sini
            </a>{" "}
            · <br />Belum punya akun?{" "}
            <button
              type="button"
              variant="link"
              onClick={() => setOpen(true)}
              className="underline underline-offset-4 hover:text-primary cursor-pointer bg-transparent border-none p-0 text-sm text-muted-foreground"
            >
              Daftar
            </button>
          </div>
        </div>
      </form>

      <RoleUserRegister open={open} onClose={() => setOpen(false)} />

    </>
  )
}
