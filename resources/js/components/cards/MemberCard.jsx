import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

export function MemberCard({ id, name, job }) {
  return (
    <Card
      data-slot="card"
      className="rounded-2xl bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card w-full h-56 border border-foreground/10 lg:h-64"
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Member Card
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">ID Member</span>
          <span className="text-sm font-semibold">{id || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Nama Lengkap</span>
          <span className="text-sm font-semibold">{name || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Pekerjaan</span>
          <span className="text-sm font-semibold">{job || "-"}</span>
        </div>
      </CardContent>
    </Card>
  )
}
