"use client"

import { usePathname } from "next/navigation"
import { Code, List, Calculator, CircleDot } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { SaveManagerDropdown } from "@/components/save-manager/save-manager-dropdown"
import Link from "next/link"

const items = [
  {
    title: "每日暗号",
    url: "/answer",
    icon: Code,
  },
  {
    title: "真元计算",
    url: "/calculator",
    icon: Calculator,
  },
  {
    title: "经脉模拟",
    url: "/answer",
    icon: CircleDot,
  },
  {
    title: "武学列表",
    url: "/skills",
    icon: List,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const handleMenuClick = () => {
    setOpenMobile(false)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroup className="flex flex-col gap-2">
          <SaveManagerDropdown className="mt-1" />
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} onClick={handleMenuClick}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
