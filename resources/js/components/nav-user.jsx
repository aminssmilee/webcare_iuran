"use client"

import { Inertia } from "@inertiajs/inertia"
import { usePage } from "@inertiajs/react"
import { ChevronsUpDown, LogOut } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { props } = usePage()

  // ✅ Ambil data admin login dari Inertia props
  const user = props.auth?.user || {}
  const userName = user?.name || "Admin"
  const userEmail = user?.email || "admin@example.com"
  const avatarUrl = user?.avatar || null
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  // ✅ Logout function
  const handleLogout = () => {
    Inertia.post("/admin/logout", {}, {
      onSuccess: () => console.log("✅ Logout berhasil"),
      onError: (err) => console.error("Logout error:", err),
    })
  }

  const getInitials = (name) => {
    if (!name) return "?"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="
                flex items-center gap-3
                data-[state=open]:bg-sidebar-accent
                data-[state=open]:text-sidebar-accent-foreground
                hover:bg-white
                hover:text-black
                text-white
                transition-colors duration-200
              "
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={userName} />
                ) : (
                  <AvatarFallback className="rounded-lg bg-white text-black">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>

              {/* teks nama + email */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>

              <ChevronsUpDown className="ml-auto size-4 opacity-80" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-sidebar text-sidebar-foreground"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={userName} />
                  ) : (
                    <AvatarFallback className="rounded-lg bg-gray-100 text-gray-700 font-medium">
                      {getInitials(userName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight text-foreground">
                  <span className="truncate font-semibold">{userName}</span>
                  <span className="truncate text-xs opacity-80">{userEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 text-left text-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>

  )
}
