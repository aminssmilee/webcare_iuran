import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({ teams }) {
  const [activeTeam] = React.useState(teams[0]) // default ambil tim pertama

  if (!activeTeam) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default">
          <div>
            {/* // className="flex aspect-square size-10 items-center justify-center rounded-lg bg-default shadow-sm text-sidebar-primary-foreground"> */}
            <img
              src={activeTeam.logo}
              alt={activeTeam.name}
              className="size-8 object-contain"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {activeTeam.name}
            </span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
