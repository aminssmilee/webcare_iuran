"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check } from "lucide-react"
import { router } from "@inertiajs/react"

export default function RoleRegisterDialog({ open, onClose }) {
  const [selected, setSelected] = useState("")

  const handleNext = () => {
    if (selected !== "") {
      router.visit(`/member/register?role=${selected}`, {
        onSuccess: () => onClose(),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="lg:min-w-[800px] lg:min-h-[260px] max-w-xs p-6 rounded-xl overflow-y-auto">
        <DialogHeader className="flex flex-col items-center gap-4">
          <h2 className="text-xl lg:text-2xl font-semibold text-center mt-6">
            Hai, Sebelum memulai, kamu mendaftar sebagai apa?
          </h2>
          <p className="text-muted-foreground text-center">
            Pilih salah satu opsi di bawah ini sesuai dengan identitas kamu.
          </p>
        </DialogHeader>

        <RadioGroup
          value={selected}
          onValueChange={setSelected}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8"
        >
          {/* Instansi */}
          <label
            htmlFor="institution"
            className={`flex items-center justify-between border border-muted-foreground/50 p-8 rounded-lg cursor-pointer transition-colors hover:bg-background/10 ${
              selected === "institution"
                ? "border-primary bg-background"
                : "border-border bg-background/5"
            }`}
          >
            <span className="text-md font-normal">Saya dari Instansi</span>
            <RadioGroupItem id="institution" value="institution" className="peer sr-only" />
            <span
              className={`w-5 h-5 flex items-center justify-center border border-muted-foreground/50 rounded ${
                selected === "institution"
                  ? "border-primary bg-primary text-white"
                  : "border-border"
              }`}
            >
              {selected === "institution" && <Check size={14} />}
            </span>
          </label>

          {/* Perorangan */}
          <label
            htmlFor="member"
            className={`flex items-center justify-between border border-muted-foreground/50 p-8 rounded-lg cursor-pointer transition-colors hover:bg-background/10 ${
              selected === "member"
                ? "border-primary bg-background"
                : "border-border bg-background/5"
            }`}
          >
            <span className="text-md font-normal">Saya bukan dari Instansi (Perorangan)</span>
            <RadioGroupItem id="member" value="member" className="peer sr-only" />
            <span
              className={`w-5 h-5 flex items-center justify-center border border-muted-foreground/50 rounded ${
                selected === "member"
                  ? "border-primary bg-primary text-white"
                  : "border-border"
              }`}
            >
              {selected === "member" && <Check size={14} />}
            </span>
          </label>
        </RadioGroup>

        <div className="flex justify-end mt-6">
          <Button
            variant="default"
            className="lg:w-28 w-full ml-auto text-sm font-normal"
            onClick={handleNext}
            disabled={selected === ""}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
