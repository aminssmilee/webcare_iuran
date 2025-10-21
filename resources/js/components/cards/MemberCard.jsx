"use client"

import { useRef } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function MemberCard({ id, name, job }) {
  const cardRef = useRef(null)
  const downloadBtnRef = useRef(null)

  const handleDownload = async () => {
    const element = cardRef.current
    const btn = downloadBtnRef.current
    if (!element) return

    // 🚫 Sembunyikan tombol sebelum screenshot
    if (btn) btn.style.display = "none"

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    })

    // ✅ Kembalikan tombol setelah selesai
    if (btn) btn.style.display = "flex"

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [element.offsetWidth, element.offsetHeight],
    })

    pdf.addImage(imgData, "PNG", 0, 0, element.offsetWidth, element.offsetHeight)
    pdf.save(`${(name || "member").replace(/\s+/g, "_")}_sinergi.pdf`)
  }

  return (
    <div
      ref={cardRef}
      className="relative w-full h-56 lg:h-64 rounded-2xl overflow-hidden shadow-md text-white flex flex-col justify-between"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(22,163,74,0.95), rgba(234,179,8,0.9)), url('/img/1-asosiasi-teknik-sistem-energi-indonesia.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Tombol Download */}
      <Button
        ref={downloadBtnRef}
        onClick={handleDownload}
        size="icon"
        className="absolute top-2 right-2 bg-transparent hover:text-black hover:bg-transparent text-white z-10 shadow-none border-none focus:outline-none"
      >
        <Download className="h-5 w-5 " />
      </Button>

      {/* Isi Kartu */}
      <Card className="bg-transparent border-none shadow-none text-white w-full h-full flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white drop-shadow-md">
            Member Card
          </CardTitle>
        </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="opacity-90">ID Member</span>
              <span className="font-semibold">{id || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Nama Lengkap</span>
              <span className="font-semibold">{name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Pekerjaan</span>
              <span className="font-semibold">{job || "-"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
