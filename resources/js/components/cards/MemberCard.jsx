import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

export function MemberCard({ id, name, job }) {
  return (
    <div className="relative w-full h-56 lg:h-64 rounded-2xl overflow-hidden shadow-md">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('/img/1-asosiasi-teknik-sistem-energi-indonesia.png')] bg-cover bg-center" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-yellow-500/70" />

      {/* Card content */}
      <Card className="relative bg-transparent text-white w-full h-full flex flex-col justify-between">
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
  )
}
