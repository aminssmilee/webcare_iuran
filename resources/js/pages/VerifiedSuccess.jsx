"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function VerifiedSuccess({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full text-center p-10 rounded-2xl shadow-md bg-white">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">
          Verifikasi Email Berhasil !
        </h1>
        <p className="text-gray-600 mb-6">
          {message || "Email kamu berhasil diverifikasi! Akunmu sekarang aktif."}
        </p>

        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
          <a href="/member/login">Login Sekarang</a>
        </Button>
      </Card>
    </div>
  )
}
