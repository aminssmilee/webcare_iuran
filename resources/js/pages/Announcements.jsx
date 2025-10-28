"use client"

import { usePage } from "@inertiajs/react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trash, Pencil } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

import AnnouncementDialog from "@/components/dialogs/AnnouncementDialog"

export default function AnnouncementsPage() {
  const { props } = usePage()
  const { announcements = [] } = props

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* ===== Header ===== */}
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/announcements">
                    Pengumuman
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* ===== Main Content ===== */}
        <div className="flex flex-1 flex-col px-4 lg:px-8 py-8 bg-background">
          <div className="flex items-center justify-end gap-4 mb-6">
            <div className="flex justify-end gap-4">
              <Select
              // value={timeRange}
              // onValueChange={(v) => {
              //   if (v && v !== timeRange) {
              //     setTimeRange(v)
              //     router.visit(`/admin/dashboard?range=${v}`, {
              //       preserveState: true,
              //       preserveScroll: true,
              //       replace: true,
              //     })
              //   }
              // }}
              >
                <SelectTrigger className="flex w-40">
                  <SelectValue placeholder="Rentang waktu" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="2020">2020</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
              {/* Dialog Tambah Pengumuman */}
              <div className="self-end">
                <AnnouncementDialog />
              </div>
            </div>
          </div>

          {/* ===== List Pengumuman ===== */}
          <div className="w-full space-y-4 border border-border/60 p-6 rounded-lg bg-card">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Daftar Pengumuman</h2>
            </div>

            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Belum ada pengumuman.
              </p>
            ) : (
              <div className="space-y-3">
                {announcements.map((item) => (
                  <Card
                    key={item.id}
                    className="border border-border/60 shadow-sm hover:shadow-md transition-all"
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-base">{item.title}</h3>

                        {/* Bagian kanan atas */}
                        <div className="flex items-center gap-1.5">
                          {/* tanggal publish */}
                          <Badge
                            variant="secondary"
                            className="text-xs flex items-center gap-1 px-2 py-0.5"
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(item.publish_date).toLocaleDateString("id-ID")}
                          </Badge>

                          {/* edit */}
                          <Button
                            variant="link"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          {/* hapus */}
                          <Button
                            variant="link"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
