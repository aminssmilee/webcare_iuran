import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Icon } from "lucide-react"

export default function WaitingApproval() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BadgeCheckIcon className="h-12 w-12 text-green-500" />
        </EmptyMedia>
        <EmptyTitle>Verifikasi Data</EmptyTitle>
        <EmptyDescription>
          Berkas Anda sedang ditinjau oleh admin. Silakan tunggu konfirmasi melalui email yang akan dikirim setelah proses verifikasi selesai.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" className="w-full">Kembali ke Beranda</Button>
      </EmptyContent>
    </Empty>
  )
}
