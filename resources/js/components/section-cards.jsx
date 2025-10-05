import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

function fmtIDR(n) {
  if (n == null) return "-"
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(n))
  } catch { return String(n) }
}
function pct(n) {
  if (n == null) return "0%"
  const v = Number(n)
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`
}

export function SectionCards({ metrics }) {
  // fallback kalau props belum ada
  const m = metrics ?? {
    revenue: { total: 0, diffPct: 0, trend: "up" },
    newCustomers: { count: 0, diffPct: 0, trend: "down" },
    activeAccounts: { count: 0, diffPct: 0, trend: "up" },
    growthRate: 0,
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2 3xl:grid-cols-4 *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      {/* Total Revenue */}
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {fmtIDR(m.revenue?.total)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              { (m.revenue?.trend ?? "up") === "up" ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" /> }
              {pct(m.revenue?.diffPct)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            { (m.revenue?.trend ?? "up") === "up" ? "Trending up this period" : "Down this period" }
            { (m.revenue?.trend ?? "up") === "up" ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" /> }
          </div>
          <div className="text-muted-foreground">Revenue in selected range</div>
        </CardFooter>
      </Card>

      {/* New Customers */}
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {m.newCustomers?.count ?? 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              { (m.newCustomers?.trend ?? "down") === "up" ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" /> }
              {pct(m.newCustomers?.diffPct)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            { (m.newCustomers?.trend ?? "down") === "up" ? "Up vs previous period" : "Down vs previous period" }
            { (m.newCustomers?.trend ?? "down") === "up" ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" /> }
          </div>
          <div className="text-muted-foreground">Registrations in selected range</div>
        </CardFooter>
      </Card>

      {/* Active Accounts */}
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {m.activeAccounts?.count ?? 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              { (m.activeAccounts?.trend ?? "up") === "up" ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" /> }
              {pct(m.activeAccounts?.diffPct)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            { (m.activeAccounts?.trend ?? "up") === "up" ? "Strong user retention" : "Retention down" }
            { (m.activeAccounts?.trend ?? "up") === "up" ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" /> }
          </div>
          <div className="text-muted-foreground">Members accepted</div>
        </CardFooter>
      </Card>

      {/* Growth Rate */}
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {Number(m.growthRate ?? 0).toFixed(1)}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              {pct(m.growthRate ?? 0)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}
