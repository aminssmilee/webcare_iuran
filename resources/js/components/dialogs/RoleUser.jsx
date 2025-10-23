"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";
import { router } from "@inertiajs/react"; // ✅ Ubah ini

export default function RoleRegisterDialog({ open, onClose }) {
  const [selected, setSelected] = useState("");

  const handleNext = () => {
    if (selected !== "") {
      // Navigasi dulu, baru tutup dialog
      router.visit("/member/register", {
        onSuccess: () => {
          onClose(); // Tutup dialog setelah navigasi berhasil
        },
      });
      
      // Atau jika ingin kirim data role:
      // router.visit("/member/register", {
      //   data: { role: selected },
      //   onSuccess: () => onClose(),
      // });
    }
  };

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
          {/* Client */}
          <label
            htmlFor="client"
            className={`flex items-center justify-between border border-muted-foreground/50 p-8 rounded-lg cursor-pointer transition-colors hover:bg-background/10 ${
              selected === "client"
                ? "border-muted-foreground bg-background dark:text-white text-foreground"
                : "border-border bg-background/5"
            }`}
          >
            <span className="text-md font-normal">Saya dari Instansi</span>
            <RadioGroupItem id="client" value="client" className="peer sr-only" />
            <span
              className={`w-5 h-5 flex items-center justify-center border border-muted-foreground/50 rounded ${
                selected === "client"
                  ? "border-muted-foreground bg-background dark:text-white text-foreground"
                  : "border-border"
              }`}
            >
              {selected === "client" && <Check size={14} />}
            </span>
          </label>

          {/* Creator */}
          <label
            htmlFor="creator"
            className={`flex items-center justify-between border border-muted-foreground/50 p-8 rounded-lg cursor-pointer transition-colors hover:bg-background/10 ${
              selected === "creator"
                ? "border-muted-foreground bg-background dark:text-white text-foreground"
                : "border-border bg-background/5 dark:text-white text-foreground"
            }`}
          >
            <span className="text-md font-normal">Saya bukan dari Instansi</span>
            <RadioGroupItem id="creator" value="creator" className="peer sr-only" />
            <span
              className={`w-5 h-5 flex items-center justify-center border border-muted-foreground/50 rounded ${
                selected === "creator"
                  ? " border-muted-foreground bg-background dark:text-white text-foreground"
                  : "border-border"
              }`}
            >
              {selected === "creator" && <Check size={14} />}
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
  );
}