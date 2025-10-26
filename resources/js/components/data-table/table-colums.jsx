// columns.js
import {
  UserActionsCell,
  RegistrationValidationActionsCell,
  PaymentValidationActionsCell,
} from "./table-action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// import { Check, Info, Loader } from "lucide-react"
// import { Check, Archive, AlertCircle, Loader } from "lucide-react"
import { Check, Archive, AlertCircle, Loader, Info } from "lucide-react"


// ========================================================
// 📋 MANAGE USER TABLE COLUMNS
// ========================================================
export function getUserColumns() {
  return [
    {
      id: "id_member",
      accessorKey: "id_member",
      header: "ID Member",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("id_member") || "-"}</span>
      ),
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue("name") || "-"}</span>
      ),
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email")
        return email ? (
          <a href={`mailto:${email}`} className="text-sm underline">
            {email}
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    { id: "roles", accessorKey: "roles", header: "Type Anggota" },
    {
      id: "nik",
      accessorKey: "nik",
      header: "NIK",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("nik") || "-"}</span>
      ),
    },
    {
      id: "birthPlaceDate",
      accessorKey: "birthPlaceDate",
      header: "TTL",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("birthPlaceDate") || "-"}</span>
      ),
    },
    {
      id: "gender",
      accessorKey: "gender",
      header: "Jenis Kelamin",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("gender") || "-"}</span>
      ),
    },
    {
      id: "address",
      accessorKey: "address",
      header: "Alamat",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("address") || "-"}</span>
      ),
    },
    {
      id: "whatsapp",
      accessorKey: "whatsapp",
      header: "No WhatsApp",
      cell: ({ row }) => {
        const wa = row.getValue("whatsapp")
        if (!wa) return <span className="text-sm text-muted-foreground">-</span>

        const digits = String(wa).replace(/\D/g, "")
        const e164 =
          digits.startsWith("62")
            ? digits
            : digits.startsWith("0")
              ? `62${digits.slice(1)}`
              : `62${digits}`

        return (
          <a
            href={`https://wa.me/${e164}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
          >
            {wa}
          </a>
        )
      },
    },
    {
      id: "education",
      accessorKey: "education",
      header: "Pendidikan Terakhir",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("education") || "-"}</span>
      ),
    },
    {
      id: "occupation",
      accessorKey: "occupation",
      header: "Jabatan",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("occupation") || "-"}</span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")

        if (status === "Pending") {
          return (
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-600 bg-yellow-50 flex items-center gap-1"
            >
              <Loader className="w-3 h-3 animate-spin" />
              <span>{status}</span>
            </Badge>
          )
        }

        if (status === "Active") {
          return (
            <Badge
              variant="outline"
              className="border-green-500 text-green-600 bg-green-50 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          )
        }

        return <Badge variant="secondary">{status || "-"}</Badge>
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => <UserActionsCell user={row.original} />,
    },
  ]
}

// ========================================================
// 🧾 REGISTRATION VALIDATION TABLE COLUMNS
// ========================================================
export function getRegistrationColumns() {
  return [
    { id: "name", accessorKey: "name", header: "Nama" },
    { id: "email", accessorKey: "email", header: "Email" },
    { id: "roles", accessorKey: "roles", header: "Type Anggota" },
    { id: "submittedAt", accessorKey: "submittedAt", header: "Tanggal Pendaftaran" },
    {
      id: "dokumen",
      accessorKey: "dokumen",
      header: "Dokumen",
      cell: ({ row }) => {
        const doc = row.original.dokumen
        if (!doc) return <span className="text-gray-400">No file</span>

        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(doc, "_blank")}
          >
            Lihat Dokumen
          </Button>
        )
      },
    },
    {
      id: "validationStatus",
      accessorKey: "validationStatus",
      header: "Status Validasi",
      cell: ({ row }) => {
        const status = row.getValue("validationStatus")

        if (status === "Pending") {
          return (
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-600 bg-yellow-50 flex items-center gap-1"
            >
              <Loader className="w-3 h-3 animate-spin" />
              <span>{status}</span>
            </Badge>
          )
        }

        if (status === "Rejected") {
          return (
            <Badge
              variant="outline"
              className="border-red-500 text-red-600 bg-red-50 flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          )
        }

        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <span>{status}</span>
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <RegistrationValidationActionsCell user={row.original} />
      ),
    },
  ]
}

// ========================================================
// 💰 PAYMENT VALIDATION TABLE COLUMNS
// ========================================================
export function getPaymentValidationColumns() {
  return [
    { id: "id_member", accessorKey: "id_member", header: "ID Member" },
    { id: "name", accessorKey: "name", header: "Nama" },
    { id: "email", accessorKey: "email", header: "Email" },
    { id: "mount", accessorKey: "mount", header: "Periode Bulan" },
    { id: "amount", accessorKey: "amount", header: "Jumlah Pembayaran" },
    {
      id: "paidAt",
      accessorKey: "paidAt",
      header: "Tanggal Pembayaran",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("paidAt") || "-"}</span>
      ),
    },
    {
      id: "paymentProof",
      accessorKey: "paymentProof",
      header: "Bukti Pembayaran",
      cell: ({ row }) => {
        const doc = row.getValue("paymentProof")
        if (!doc) return <span className="text-sm text-muted-foreground">-</span>
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(doc, "_blank")}
          >
            Lihat Dokumen
          </Button>
        )
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status Pembayaran",
      cell: ({ row }) => {
        const status = row.getValue("status")

        if (status === "Pending") {
          return (
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-500 flex items-center gap-1"
            >
              <Loader className="w-3 h-3 animate-spin" />
              <span>{status}</span>
            </Badge>
          )
        }

        if (["Completed"].includes(status)) {

          return (
            <Badge
              variant="outline"
              className="border-green-500 text-green-500 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Approved</span>
            </Badge>
          )
        }

        if (["Failed", "failed"].includes(status)) {
          return (
            <Badge
              variant="outline"
              className="border-red-500 text-red-500 flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              <span>Rejected</span>
            </Badge>
          )
        }

        return <Badge variant="secondary">{status}</Badge>
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <PaymentValidationActionsCell payment={row.original} />
      ),
    },
  ]
}

// ========================================================
// 📅 PAYMENT LIST TABLE COLUMNS
// ========================================================
export function getPaymentColumns() {
  return [
    { id: "mount", accessorKey: "mount", header: "Periode Bulan" },
    { id: "amount", accessorKey: "amount", header: "Jumlah" },
    {
      id: "paidAt",
      accessorKey: "paidAt",
      header: "Tanggal Pembayaran",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("paidAt") || "-"}</span>
      ),
    },
    {
      id: "dueDate",
      accessorKey: "dueDate",
      header: "Tenggat",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("dueDate") || "-"}</span>
      ),
    },
    {
      id: "paymentProof",
      accessorKey: "paymentProof",
      header: "Bukti Bayar",
      cell: ({ row }) => {
        const doc = row.getValue("paymentProof")
        if (!doc) return <span className="text-sm text-muted-foreground">-</span>

        const href =
          typeof doc === "string" && doc.startsWith("http")
            ? doc
            : `${window.location.origin}${String(doc).startsWith("/") ? "" : "/"
            }${doc}`

        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
          >
            Lihat Bukti
          </Button>
        )
      },
    },
    {
      id: "note",
      accessorKey: "note",
      header: "Keterangan",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("note") || "-"}</span>
      ),
    },
    {
      id: "payment_status",
      accessorKey: "payment_status",
      header: "Status Pembayaran",
      cell: ({ row }) => {
        const status = row.getValue("payment_status") || "-"

        // 🟢 Rapel Tepat Waktu
        if (status.startsWith("Rapel") && !status.includes("Terlambat")) {
          return (
            <Badge
              variant="outline"
              className="border-green-500 text-green-600 bg-green-50 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          )
        }

        // 🔴 Rapel Terlambat
        if (status.startsWith("Rapel") && status.includes("Terlambat")) {
          return (
            <Badge
              variant="outline"
              className="border-red-500 text-red-600 bg-red-50 flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          )
        }

        // 🟢 Tepat Waktu
        if (status === "Tepat Waktu") {
          return (
            <Badge
              variant="outline"
              className="border-green-500 text-green-600 bg-green-50 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          )
        }

        // 🔴 Terlambat
        if (status === "Pembayaran Terlambat") {
          return (
            <Badge
              variant="outline"
              className="border-red-500 text-red-600 bg-red-50 flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          )
        }

        // 🟡 Pembayaran di Awal (Bulan Depan)
        if (status === "Pembayaran Di Awal (Bulan Depan)") {
          return (
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-600 bg-yellow-50 flex items-center gap-1"
            >
              <Loader className="w-3 h-3 animate-spin" />
              <span>{status}</span>
            </Badge>
          )
        }

        // ⚪ Default
        return (
          <Badge
            variant="outline"
            className="border-gray-400 text-gray-600 bg-gray-50 flex items-center gap-1"
          >
            <span>{status}</span>
          </Badge>
        )
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Validasi Admin",
      cell: ({ row }) => {
        const status = row.getValue("status")

        if (status === "Pending") {
          return (
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-500 flex items-center gap-1"
            >
              <Loader className="w-3 h-3 animate-spin" />
              <span>{status}</span>
            </Badge>
          )
        }

        // if (status === "Approved") {
        if (["Completed"].includes(status)) {

          return (
            <Badge
              variant="outline"
              className="border-green-500 text-green-500 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Approved</span>
            </Badge>
          )
        }

        if (["Failed", "failed"].includes(status)) {
          return (
            <Badge
              variant="outline"
              className="border-red-500 text-red-600 bg-red-50 flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              <span>Rejected</span>
            </Badge>
          )
        }

        return <Badge variant="default">{status || "-"}</Badge>
      },
    },
  ]
}
