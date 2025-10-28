"use client"
import React from "react"
import PropTypes from "prop-types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Helpers
function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatDateID(input) {
  if (!input) return "-"
  // handle "YYYY-MM-DD" atau "YYYY-MM-DD HH:MM:SS"
  const s = String(input).slice(0, 10)
  const [y, m, d] = s.split("-").map(Number)
  if (!y || !m || !d) return s || "-"
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
}

function mapGender(code) {
  if (!code) return "-"
  return code === "L" ? "Laki-laki" : code === "P" ? "Perempuan" : String(code)
}

export default function ProfileInfo({ user, member, onEdit }) {
  // Gabungkan data dari user dan member (nama/email/status di users, sisanya di members)
  const mergedData = {
    name: user?.name || "-",
    email: user?.email || "-",
    status: user?.status || "Pending",
    nik: member?.nik || "-",
    tgl_lahir: formatDateID(member?.tgl_lahir), // ← pakai tgl_lahir
    gender: mapGender(member?.jenis_kelamin),   // ← L/P → teks
    address: member?.alamat || "-",
    whatsapp: member?.no_wa || "-",
    education: member?.pendidikan || "-",
    occupation: member?.pekerjaan || "-",
    role: user?.role || "-",
  }

  const statusClasses =
    (mergedData.status || "").toLowerCase() === "active"
      ? "text-green-600"
      : (mergedData.status || "").toLowerCase() === "rejected"
      ? "text-red-600"
      : (mergedData.status || "").toLowerCase() === "inactive"
      ? "text-gray-600"
      : "text-yellow-600" // pending & default

  return (
    <Card className="w-full p-6 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-md font-medium text-foreground -ml-2">
            {getInitials(mergedData.name)}
          </div>

          {/* Basic Info */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-foreground">{mergedData.name}</h2>
            <span className="text-sm text-muted-foreground">{mergedData.email}</span>
            <span className={`text-xs font-medium ${statusClasses}`}>{mergedData.status}</span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex gap-2 self-end lg:self-auto">
          <Button variant="secondary" onClick={onEdit}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Detail label="NIK / KTP" value={mergedData.nik} />
        <Detail label="Tanggal Lahir" value={mergedData.tgl_lahir} />
        <Detail label="Jenis Kelamin" value={mergedData.gender} />
        <Detail label="Alamat" value={mergedData.address} />
        <Detail label="No WhatsApp" value={mergedData.whatsapp} />
        <Detail label="Pendidikan" value={mergedData.education} />
        <Detail label="Pekerjaan" value={mergedData.occupation} />
        <Detail label="Jenis Akun" value={mergedData.role} />
      </div>
    </Card>
  )
}

// Reusable sub-component
function Detail({ label, value }) {
  const v = typeof value === "string" ? value.trim() : value
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{v && v !== "" ? v : "-"}</span>
    </div>
  )
}

Detail.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

ProfileInfo.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  member: PropTypes.shape({
    nik: PropTypes.string,
    tgl_lahir: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]), // ← ganti dari ttl ke tgl_lahir
    jenis_kelamin: PropTypes.string, // 'L' atau 'P'
    alamat: PropTypes.string,
    no_wa: PropTypes.string,
    pendidikan: PropTypes.string,
    pekerjaan: PropTypes.string,
  }),
  onEdit: PropTypes.func,
}
