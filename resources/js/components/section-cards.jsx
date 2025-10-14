"use client"
import { TrendingDownIcon, TrendingUpIcon, MinusIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

function fmtIDR(n) {
  if (n == null) return "-"
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(n))
  } catch {
    return String(n)
  }
}

function pct(n) {
  if (n == null) return "0%"
  const v = Number(n)
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`
}

export function SectionCards({ metrics }) {
  const m = metrics ?? {
    revenue: { total: 0, diffPct: 0, trend: "up" },
    newMembers: { count: 0, diffPct: 0, trend: "down" },
    newInstitutions: { count: 0, diffPct: 0, trend: "down" },
    growthRate: 0,
  }

  // fungsi bantu: ambil ikon sesuai tren
  const trendIcon = (trend) => {
    if (trend === "up") return <TrendingUpIcon className="size-3 text-green-600" />
    if (trend === "down") return <TrendingDownIcon className="size-3 text-red-600" />
    return <MinusIcon className="size-3 text-yellow-600" />
  }

  const trendText = (trend) => {
    if (trend === "up") return "Up vs previous period"
    if (trend === "down") return "Down vs previous period"
    return "Stable vs previous period"
  }

  const trendColor = (trend) =>
    trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-yellow-600"

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2 3xl:grid-cols-4 *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      {/* ====================== */}
      {/* 💰 Total Revenue */}
      {/* ====================== */}
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Total Iuran Bulan Ini</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {fmtIDR(m.revenue?.total)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className={`flex gap-1 rounded-lg text-xs ${
                trendColor(m.revenue?.trend)
              }`}
            >
              {trendIcon(m.revenue?.trend)}
              {pct(m.revenue?.diffPct)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className={`flex-col items-start gap-1 text-sm ${trendColor(m.revenue?.trend)}`}>
          <div className="line-clamp-1 flex gap-2 font-medium">
            {trendText(m.revenue?.trend)}
            {m.revenue?.trend === "up"
              ? <TrendingUpIcon className="size-4" />
              : m.revenue?.trend === "down"
              ? <TrendingDownIcon className="size-4" />
              : <MinusIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">Revenue in selected range</div>
        </CardFooter>
      </Card>

      {/* ====================== */}
      {/* 👥 Anggota Baru Non Instansi */}
      {/* ====================== */}
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Anggota Baru Non Instansi</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {m.newMembers?.count ?? 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className={`flex gap-1 rounded-lg text-xs ${
                trendColor(m.newMembers?.trend)
              }`}
            >
              {trendIcon(m.newMembers?.trend)}
              {pct(m.newMembers?.diffPct)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className={`flex-col items-start gap-1 text-sm ${trendColor(m.newMembers?.trend)}`}>
          <div className="line-clamp-1 flex gap-2 font-medium">
            {trendText(m.newMembers?.trend)}
            {m.newMembers?.trend === "up"
              ? <TrendingUpIcon className="size-4" />
              : m.newMembers?.trend === "down"
              ? <TrendingDownIcon className="size-4" />
              : <MinusIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Registrations in selected range
          </div>
        </CardFooter>
      </Card>

      {/* ====================== */}
      {/* 🏢 Anggota Baru Instansi */}
      {/* ====================== */}
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Anggota Baru Instansi</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {m.newInstitutions?.count ?? 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className={`flex gap-1 rounded-lg text-xs ${
                trendColor(m.newInstitutions?.trend)
              }`}
            >
              {trendIcon(m.newInstitutions?.trend)}
              {pct(m.newInstitutions?.diffPct)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className={`flex-col items-start gap-1 text-sm ${trendColor(m.newInstitutions?.trend)}`}>
          <div className="line-clamp-1 flex gap-2 font-medium">
            {trendText(m.newInstitutions?.trend)}
            {m.newInstitutions?.trend === "up"
              ? <TrendingUpIcon className="size-4" />
              : m.newInstitutions?.trend === "down"
              ? <TrendingDownIcon className="size-4" />
              : <MinusIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Registrations in selected range
          </div>
        </CardFooter>
      </Card>

      {/* ====================== */}
      {/* 📈 Growth Rate */}
      {/* ====================== */}
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Persentase Pertumbuhan</CardDescription>
          <CardTitle
            className={`@[250px]/card:text-3xl text-2xl font-semibold tabular-nums ${trendColor(
              m.growthRate > 0 ? "up" : m.growthRate < 0 ? "down" : "stable"
            )}`}
          >
            {Number(m.growthRate ?? 0).toFixed(1)}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className={`flex gap-1 rounded-lg text-xs ${
                m.growthRate > 0
                  ? "text-green-600"
                  : m.growthRate < 0
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {m.growthRate > 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : m.growthRate < 0 ? (
                <TrendingDownIcon className="size-3" />
              ) : (
                <MinusIcon className="size-3" />
              )}
              {pct(m.growthRate)}
            </Badge>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1 text-sm">
          {m.growthRate > 0 ? (
            <>
              <div className="line-clamp-1 flex gap-2 font-medium text-green-600">
                Steady performance <TrendingUpIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Meets growth projections
              </div>
            </>
          ) : m.growthRate < 0 ? (
            <>
              <div className="line-clamp-1 flex gap-2 font-medium text-red-600">
                Performance dropped <TrendingDownIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Below expected growth
              </div>
            </>
          ) : (
            <>
              <div className="line-clamp-1 flex gap-2 font-medium text-yellow-600">
                Stable <MinusIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                No significant change
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
