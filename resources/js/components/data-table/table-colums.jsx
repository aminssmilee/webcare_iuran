// columns.js
import { UserActionsCell, RegistrationValidationActionsCell, PaymentValidationActionsCell } from "./table-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Info, Loader } from "lucide-react";


//  Manage User
export function getUserColumns() {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
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
    {
      id: "idNumber",
      accessorKey: "idNumber",
      header: "ID Number",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("idNumber") || "-"}</span>
      ),
    },
    {
      id: "birthPlaceDate",
      accessorKey: "birthPlaceDate",
      header: "Birth Date", // kalau mau tetap "Birth Place / Date" silakan ganti
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("birthPlaceDate") || "-"}</span>
      ),
    },
    {
      id: "gender",
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("gender") || "-"}</span>
      ),
    },
    {
      id: "address",
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("address") || "-"}</span>
      ),
    },
    {
      id: "whatsapp",
      accessorKey: "whatsapp",
      header: "WhatsApp",
      cell: ({ row }) => {
        const wa = row.getValue("whatsapp")
        if (!wa) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
        // normalisasi ke format wa.me (62…)
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
      header: "Education",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("education") || "-"}</span>
      ),
    },
    {
      id: "occupation",
      accessorKey: "occupation",
      header: "Occupation",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("occupation") || "-"}</span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.getValue("status") || "-"
        const color =
          s === "Active"
            ? "border-green-500 text-green-600"
            : s === "Pending"
            ? "border-yellow-500 text-yellow-600"
            : s === "Rejected"
            ? "border-red-500 text-red-600"
            : "border-gray-400 text-gray-600"
        return (
          <Badge variant="outline" className={`w-auto ${color}`}>
            {s}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <UserActionsCell user={row.original} />,
    },
  ]
}

//  Registration Validation
export function getRegistrationColumns() {
  return [
    { id: "name", accessorKey: "name", header: "Name" },
    { id: "email", accessorKey: "email", header: "Email" },
    { id: "idNumber", accessorKey: "idNumber", header: "ID Number" },
    { id: "submittedAt", accessorKey: "submittedAt", header: "Submitted At" },
    {
      id: "dokumen",
      accessorKey: "dokumen",
      header: "Document",
      cell: ({ row }) => {
        // Gunakan row.original supaya ambil langsung dari data asli inertia
        const doc = row.original.dokumen;
        console.log("Dokumen path row:", doc);

        if (!doc) {
          return <span className="text-gray-400">No file</span>;
        }

        return (
          <a
            href={doc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View
          </a>
        );
      },
    },

    {
      id: "validationStatus",
      accessorKey: "validationStatus",
      header: "Validation Status",
      cell: ({ row }) => {
        const status = row.getValue("validationStatus");
        if (status === "Pending") {
          return (
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping inline-block"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping inline-block" style={{ animationDelay: "0.15s" }}></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping inline-block" style={{ animationDelay: "0.3s" }}></span>
              <span className="text-gray-700 font-medium">{status}</span>
            </div>
          )
        }
        return <span>{status}</span>
      }
    },
    { id: "actions", header: "Actions", cell: ({ row }) => <RegistrationValidationActionsCell user={row.original} /> },
  ];
}

//  Payment Validation
export function getPaymentValidationColumns() {
  return [
    { id: "name", accessorKey: "name", header: "Name" },
    { id: "email", accessorKey: "email", header: "Email" },
    { id: "idNumber", accessorKey: "idNumber", header: "ID Number" },
    { id: "Mount", accessorKey: "mount", header: "Mount Period" },
    { id: "amount", accessorKey: "amount", header: "Amount" },
    {
      id: "dueDate",
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.getValue("dueDate");
        return date ? (
          <span className="text-sm">{date}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },

    {
      id: "paidAt",
      accessorKey: "paidAt",
      header: "Paid At",
      cell: ({ row }) => {
        const date = row.getValue("paidAt");
        return date ? (
          <span className="text-sm">{date}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },

    // Kolom dokumen bukti bayar
    {
      id: "paymentProof",
      accessorKey: "paymentProof",
      header: "Payment Proof",
      cell: ({ row }) => {
        const doc = row.getValue("paymentProof");
        if (!doc) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(doc, "_blank")}
          >
            Lihat Dokumen
          </Button>
        );
      }
    },

    // Kolom keterangan
    {
      id: "note",
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => <span className="text-sm">{row.getValue("note") || "-"}</span>
    },

    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");

        if (status === "Pending") {
          return (
            <Badge variant="outline" className=" w-auto border-yellow-500 text-yellow-500 flex items-center space-x-1">
              <Loader className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          );
        }
        else if (status === "Completed") {
          return (
            <Badge variant="outline" className="w-auto border-green-500 text-green-500 flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          );
        }
        else if (status === "Failed") {
          return (
            <Badge variant="outline" className="w-auto border-red-500 text-red-500 flex items-center space-x-1">
              <Info className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          );
        }
        return <Badge variant="default">{status}</Badge>;
      }
    },
    { id: "actions", header: "Actions", cell: ({ row }) => <PaymentValidationActionsCell payment={row.original} /> },
  ];
}

//  Payment List
export function getPaymentColumns() {
  return [
    { id: "mount", accessorKey: "mount", header: "Month Period" },

    { id: "amount", accessorKey: "amount", header: "Amount" },

    {
      id: "dueDate",
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.getValue("dueDate")
        return date ? (
          <span className="text-sm">{date}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },

    {
      id: "paidAt",
      accessorKey: "paidAt",
      header: "Paid At",
      cell: ({ row }) => {
        const date = row.getValue("paidAt")
        return date ? (
          <span className="text-sm">{date}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },

    // Bukti bayar
    {
      id: "paymentProof",
      accessorKey: "paymentProof",
      header: "Payment Proof",
      cell: ({ row }) => {
        const doc = row.getValue("paymentProof")
        if (!doc) {
          return <span className="text-sm text-muted-foreground">-</span>
        }

        // Support path relatif (mis. "/storage/payments/xxx.pdf")
        const href =
          typeof doc === "string" && doc.startsWith("http")
            ? doc
            : `${window.location.origin}${String(doc).startsWith("/") ? "" : "/"}${doc}`

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

    // Keterangan
    {
      id: "note",
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("note") || "-"}</span>
      ),
    },

    // Status
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
              className="w-auto border-yellow-500 text-yellow-500 flex items-center space-x-1"
            >
              <Loader className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          )
        }

        if (status === "Completed") {
          return (
            <Badge
              variant="outline"
              className="w-auto border-green-500 text-green-500 flex items-center space-x-1"
            >
              <Check className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          )
        }

        if (status === "Failed") {
          return (
            <Badge
              variant="outline"
              className="w-auto border-red-500 text-red-500 flex items-center space-x-1"
            >
              <Info className="w-3 h-3" />
              <span>{status}</span>
            </Badge>
          )
        }

        // default fallback
        return <Badge variant="default">{status || "-"}</Badge>
      },
    },
  ]
}
