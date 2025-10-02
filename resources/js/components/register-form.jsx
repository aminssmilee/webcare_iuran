"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { Inertia } from "@inertiajs/inertia";

export function RegisterForm({ className, ...props }) {
  const [errors, setErrors] = useState({}); // error lokal (client) + server
  const [submitting, setSubmitting] = useState(false);

  function validateBeforeSubmit(form) {
    const e = {};

    const nama = (form.get("nama_lengkap") || "").trim();
    const email = (form.get("email") || "").trim();
    const password = form.get("password") || "";
    const password_confirmation = form.get("password_confirmation") || "";
    const file = form.get("dokumen"); // File | null

    if (!nama) e.nama_lengkap = "Nama lengkap wajib diisi.";
    if (!email) e.email = "Email wajib diisi.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Format email tidak valid.";

    if (!password) e.password = "Password wajib diisi.";
    else if (password.length < 6) e.password = "Password minimal 6 karakter.";

    if (!password_confirmation) {
      e.password_confirmation = "Konfirmasi password wajib diisi.";
    } else if (password !== password_confirmation) {
      e.password_confirmation = "Konfirmasi password tidak cocok.";
    }

    if (file && file.size) {
      if (file.type !== "application/pdf") e.dokumen = "Dokumen harus PDF.";
      if (file.size > 2 * 1024 * 1024) e.dokumen = "Maksimal 2MB.";
    }

    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    setErrors({});

    const form = new FormData(ev.target);
    const localErr = validateBeforeSubmit(form);

    // Jika ada error lokal, tampilkan semua & hentikan submit
    if (Object.keys(localErr).length > 0) {
      setErrors(localErr);
      // scroll ke error pertama (optional)
      const firstKey = Object.keys(localErr)[0];
      const el = ev.target.querySelector(`[name="${firstKey}"]`);
      if (el) el.focus();
      return;
    }

    // Submit ke backend
    setSubmitting(true);
    Inertia.post("/member/register", form, {
      forceFormData: true,
      onError: (serverErr) => {
        // tampilkan validasi dari Laravel
        setErrors((prev) => ({ ...prev, ...serverErr }));
        setSubmitting(false);
      },
      onSuccess: () => {
        Inertia.visit("/member/waiting-approval");
      },
      onFinish: () => setSubmitting(false),
    });
  }

  // helper untuk memberi border merah kalau error
  const errClass = (key) =>
    errors[key] ? "border-red-500 focus-visible:ring-red-500" : "";

  // saat user mengetik, bersihkan error field tsb
  const clearErrOnChange = (key) => () =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _, ...rest } = prev;
      return rest;
    });

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create a new account</h1>
        <p className="text-sm text-muted-foreground">
          Fill in your details to register a new account
        </p>
      </div>

      <div className="grid gap-6">
        {/* Username */}
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="nama_lengkap"
            type="text"
            placeholder="Your username"
            className={errClass("nama_lengkap")}
            onChange={clearErrOnChange("nama_lengkap")}
          />
          {errors.nama_lengkap && (
            <p className="text-sm text-red-500">{errors.nama_lengkap}</p>
          )}
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className={errClass("email")}
            onChange={clearErrOnChange("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            className={errClass("password")}
            onChange={clearErrOnChange("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="grid gap-2">
          <Label htmlFor="password_confirmation">Confirm Password</Label>
          <Input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            placeholder="Repeat password"
            className={errClass("password_confirmation")}
            onChange={clearErrOnChange("password_confirmation")}
          />
          {errors.password_confirmation && (
            <p className="text-sm text-red-500">
              {errors.password_confirmation}
            </p>
          )}
        </div>

        {/* Document */}
        <div className="grid gap-2">
          <Label htmlFor="document">Upload Your Document</Label>
          <label
            htmlFor="document"
            className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input bg-background text-muted-foreground hover:bg-muted transition-colors"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="text-sm">Upload a document (PDF)</span>
            </div>
            <Input
              id="document"
              name="dokumen"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={clearErrOnChange("dokumen")}
            />
          </label>
          {errors.dokumen && (
            <p className="text-sm text-red-500">{errors.dokumen}</p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Processing..." : "Register"}
        </Button>
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/member/login" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  );
}
