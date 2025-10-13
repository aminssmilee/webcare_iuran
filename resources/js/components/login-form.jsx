"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "@inertiajs/react"
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({ className, ...props }) {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
  })

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
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>

      <div className="grid gap-6">
        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
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
              <Label htmlFor="password">Password</Label>
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
          {processing ? "Logging in..." : "Login"}
        </Button>
      </div>

      {/* Global error (inactive/pending) */}
      {errors.auth && (
        <p className="text-center text-sm text-red-500 mt-2">{errors.auth}</p>
      )}

      <div className="text-center text-sm space-y-1">
        <div className="text-center text-sm text-muted-foreground">
          Forgot your password?{" "}
          <a href="/contact-admin" className="underline underline-offset-4 hover:text-primary">
            Contact admin
          </a>{" "}
          · Don&apos;t have an account?{" "}
          <a href="/member/register" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </a>
        </div>
      </div>
    </form>
  )
}
