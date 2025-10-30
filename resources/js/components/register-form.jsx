"use client";

import { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, File, Trash, Eye, EyeOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function RegisterForm({ className, ...props }) {
  const { props: page } = usePage();
  const flash = page.flash || {};
  const serverErrors = page.errors || {};

  const [errors, setErrors] = useState(serverErrors);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Ambil role dari URL (client = instansi, creator = perorangan)
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get("role"); // client / creator

  // 🔔 Tampilkan alert jika register sukses
  useEffect(() => {
    if (flash.success) alert(flash.success);
  }, [flash.success]);

  // 🔍 Validasi sebelum submit
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
      if (file.type !== "application/pdf") e.dokumen = "Dokumen harus berupa PDF.";
      if (file.size > 2 * 1024 * 1024) e.dokumen = "Maksimal 2MB.";
    }

    return e;
  }

  // 🚀 Submit ke server
  function handleSubmit(ev) {
    ev.preventDefault();
    setErrors({});

    const form = new FormData(ev.target);

    // tambahkan role dari URL
    form.append("role", roleParam || "");

    // tambahkan file manual
    if (file) form.set("dokumen", file);

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

  const errClass = (key) =>
    errors[key] ? "border-red-500 focus-visible:ring-red-500" : "";

  const clearErrOnChange = (key) => () =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _, ...rest } = prev;
      return rest;
    });

  // 📎 Handle upload dokumen
  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setErrors({ dokumen: "Dokumen harus berupa PDF." });
      return;
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      setErrors({ dokumen: "Ukuran dokumen maksimal 2MB." });
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setUploading(false);
    clearErrOnChange("dokumen")();
  }

  function handleRemoveFile() {
    setFileName(null);
    document.getElementById("document").value = "";
  }

  // 🧩 UI
  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className={cn("flex flex-col gap-8", className)}
      {...props}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl lg:text-2xl font-bold">Buat Akun Baru</h1>
        <p className="text-sm text-muted-foreground">
          Isi data Anda untuk mendaftar akun baru
        </p>
      </div>

      {/* ================== FIELD ================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nama */}
        <div className="grid gap-2">
          {roleParam === "institution" ? (
            <>
              <Label htmlFor="username">Asal Instansi *</Label>
              <Input
                id="username"
                name="nama_instansi"
                type="text"
                placeholder="Nama instansi Anda"
                className={errClass("nama_instansi")}
                onChange={clearErrOnChange("nama_instansi")}
              />
              {errors.nama_instansi && (
                <p className="text-sm text-red-500">{errors.nama_instansi}</p>
              )}
            </>
          ) : (
            <>
              <Label htmlFor="username">Nama Lengkap *</Label>
              <Input
                id="username"
                name="nama_lengkap"
                type="text"
                placeholder="Nama lengkap Anda"
                className={errClass("nama_lengkap")}
                onChange={clearErrOnChange("nama_lengkap")}
              />
              {errors.nama_lengkap && (
                <p className="text-sm text-red-500">{errors.nama_lengkap}</p>
              )}
            </>
          )}
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="contoh@gmail.com"
            className={errClass("email")}
            onChange={clearErrOnChange("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="grid gap-2 relative">
          <Label htmlFor="password">Kata Sandi *</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              className={errClass("password") + " pr-10"}
              onChange={clearErrOnChange("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Konfirmasi Password */}
        <div className="grid gap-2 relative">
          <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi*</Label>
          <div className="relative">
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type={showConfirm ? "text" : "password"}
              placeholder="Ulangi kata sandi"
              className={errClass("password_confirmation") + " pr-10"}
              onChange={clearErrOnChange("password_confirmation")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-sm text-red-500">
              {errors.password_confirmation}
            </p>
          )}
        </div>
      </div>

      {/* ================== CATATAN ROLE ================== */}
      {roleParam === "institution" && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 text-sm text-blue-800">
          <strong>Catatan:</strong> Anggota <b>Institusi</b> wajib mengunggah salah satu
          dari dokumen berikut:
          <ul className="list-disc list-inside mt-1">
            <li>SK Pendirian Prodi</li>
            <li>Akta Pendirian Perusahaan</li>
            <li>Akta Pendirian Perkumpulan</li>
          </ul>
        </div>
      )}

      {roleParam === "member" && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Catatan:</strong> Anggota <b>Perorangan</b> wajib mengunggah salah satu
          dari dokumen berikut:
          <ul className="list-disc list-inside mt-1">
            <li>KTP</li>
            <li>SIM</li>
            <li>Kartu Mahasiswa</li>
          </ul>
        </div>
      )}

      {/* ================== UPLOAD FILE ================== */}
      <div className="grid gap-2">
        <Label htmlFor="document">
          {roleParam === "client"
            ? "Unggah Dokumen Institusi *"
            : "Unggah Dokumen Identitas *"}
        </Label>
        {!fileName ? (
          <label
            htmlFor="document"
            className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input bg-background text-muted-foreground hover:bg-muted transition-colors"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3 w-2/3">
                <span className="text-sm text-primary">Sedang mengunggah...</span>
                <Progress value={progress} className="w-full h-2" />
                <small className="text-xs text-muted-foreground">{progress}%</small>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="text-sm">Unggah dokumen (PDF)</span>
                <small className="text-xs text-muted-foreground">Maks 2MB</small>
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
        ) : (
          <div className="relative flex flex-col items-start justify-between rounded-lg border px-4 py-3">
            <button
              type="button"
              onClick={handleRemoveFile}
              className="self-end top-2 right-2 rounded-full px-1 py-1 transition"
            >
              <Trash className="h-4 w-4 text-red-500" />
            </button>
            <div className="flex flex-row items-center gap-2">
              <File className="h-4 w-4 text-green-700" />
              <span className="text-sm text-green-700">{fileName}</span>
            </div>
          </div>
        )}
        {errors.dokumen && <p className="text-sm text-red-500">{errors.dokumen}</p>}
      </div>

      {/* ================== SUBMIT ================== */}
      <Button type="submit" className="w-full h-11 font-semibold" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Memproses...
          </>
        ) : (
          "Daftar"
        )}
      </Button>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <a
          href="/member/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Masuk
        </a>
      </div>
    </form>
  );
}
