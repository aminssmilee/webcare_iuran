"use client"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function ChartAreaInteractive({ data, timeRange }) {
  const isMobile = useIsMobile()

  // Validasi data
  const labels = data?.labels ?? []
  const series = data?.series ?? {}

  // Gabungkan data chart jadi format recharts
  const chartData = React.useMemo(() => {
    if (!labels.length) return []
    return labels.map((label, i) => ({
      date: label,
      revenue: series.revenue?.[i] ?? 0,
      new_customers: series.new_customers?.[i] ?? 0,
      active_accounts: series.active_accounts?.[i] ?? 0,
    }))
  }, [labels, series])

  // Filter data sesuai time range
  const filteredData = React.useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    return chartData.slice(-days)
  }, [chartData, timeRange])

  // Config warna chart
  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
    new_customers: { label: "New Customers", color: "hsl(var(--chart-2))" },
    active_accounts: { label: "Active Accounts", color: "hsl(var(--chart-3))" },
  }

  return (
    <Card className="@container/card">
      <CardTitle className="px-2 pt-4 sm:px-6 sm:pt-6">
        Total Growth (Revenue, New Customers, Active Accounts)
      </CardTitle>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillNewCustomers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-new_customers)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-new_customers)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillActiveAccounts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-active_accounts)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-active_accounts)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("id-ID", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            {/* Area Chart Lines */}
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
            />
            <Area
              dataKey="new_customers"
              type="natural"
              fill="url(#fillNewCustomers)"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
            />
            <Area
              dataKey="active_accounts"
              type="natural"
              fill="url(#fillActiveAccounts)"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
