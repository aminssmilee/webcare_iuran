"use client";

import { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";

export function RegisterForm({ className, ...props }) {
  const { props: page } = usePage();
  const flash = page.flash || {};
  const serverErrors = page.errors || {};

  const [errors, setErrors] = useState(serverErrors);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🔔 Show flash success (after redirect)
  useEffect(() => {
    if (flash.success) alert(flash.success);
  }, [flash.success]);

  // ✅ Validasi sebelum kirim form
  function validateBeforeSubmit(form) {
    const e = {};
    const nama = (form.get("nama_lengkap") || "").trim();
    const email = (form.get("email") || "").trim();
    const password = form.get("password") || "";
    const password_confirmation = form.get("password_confirmation") || "";
    const file = form.get("dokumen");

    if (!nama) e.nama_lengkap = "Nama lengkap wajib diisi.";
    if (!email) e.email = "Email wajib diisi.";
    else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(email))
      e.email = "Email harus menggunakan domain @gmail.com.";

    if (!password) e.password = "Password wajib diisi.";
    else if (password.length < 6) e.password = "Password minimal 6 karakter.";

    if (!password_confirmation)
      e.password_confirmation = "Konfirmasi password wajib diisi.";
    else if (password !== password_confirmation)
      e.password_confirmation = "Konfirmasi password tidak cocok.";

    if (!file || !file.size)
      e.dokumen = "Dokumen wajib diupload (PDF maksimal 2MB).";
    else {
      if (file.type !== "application/pdf") e.dokumen = "Dokumen harus PDF.";
      if (file.size > 2 * 1024 * 1024) e.dokumen = "Maksimal 2MB.";
    }

    return e;
  }

  // ✅ Submit ke server via Inertia router
  function handleSubmit(ev) {
    ev.preventDefault();
    setErrors({});
    const form = new FormData(ev.target);
    const localErr = validateBeforeSubmit(form);

    if (Object.keys(localErr).length > 0) {
      setErrors(localErr);
      const firstKey = Object.keys(localErr)[0];
      ev.target.querySelector(`[name="${firstKey}"]`)?.focus();
      return;
    }

    setSubmitting(true);

    router.post("/member/register", form, {
      forceFormData: true,
      onError: (serverErr) => {
        setErrors(serverErr || {});
        setSubmitting(false);
      },
      onFinish: () => setSubmitting(false),
    });
  }

  // ✅ Helpers
  const errClass = (key) =>
    errors[key] ? "border-red-500 focus-visible:ring-red-500" : "";

  const clearErrOnChange = (key) => () =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _, ...rest } = prev;
      return rest;
    });

  // ✅ File upload handling
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    // Simulasi waktu upload
    setTimeout(() => {
      setFileName(file.name);
      setUploading(false);
      clearErrOnChange("dokumen")();
    }, 1200);
  }

  function handleRemoveFile() {
    setFileName(null);
    document.getElementById("document").value = "";
  }

  // ✅ Render
  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create a new account</h1>
        <p className="text-sm text-muted-foreground">
          Fill in your details to register a new account
        </p>
      </div>

      {/* Fields */}
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
            placeholder="you@gmail.com"
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

        {/* Upload Document */}
        <div className="grid gap-2 relative">
          {!fileName ? (
            <>
              <Label htmlFor="document">Upload Your Document</Label>
              <label
                htmlFor="document"
                className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input bg-background text-muted-foreground hover:bg-muted transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 animate-pulse">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-primary">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload a document (PDF)</span>
                  </div>
                )}
                <Input
                  id="document"
                  name="dokumen"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </>
          ) : (
            <div className="relative flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
              <div className="flex flex-col">
                <Label htmlFor="document" className="font-semibold text-sm">
                  Uploaded Document
                </Label>
                <span className="text-sm text-green-700">{fileName}</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 rounded-full p-1 hover:bg-red-100 transition"
              >
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          )}

          {errors.dokumen && (
            <p className="text-sm text-red-500">{errors.dokumen}</p>
          )}
          {errors.error && (
            <p className="text-sm text-red-500">{errors.error}</p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/member/login" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  );
}
