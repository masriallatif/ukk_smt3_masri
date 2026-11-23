"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  BedDouble,
  GraduationCap,
  LayoutDashboard,
  School,
  Shapes,
  Users,
  Wrench,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Manajemen User", url: "/admin/users", icon: Users },
  { title: "Tipe Unit", url: "/admin/unit-types", icon: BedDouble },
  { title: "Fasilitas", url: "/admin/facilities", icon: Wrench },
  { title: "Kategori", url: "/admin/category", icon: Shapes },
  { title: "Jurusan", url: "/admin/jurusan", icon: GraduationCap },
  { title: "Artikel", url: "/admin/artikel", icon: BookOpen },
  { title: "Profil", url: "/admin/profile", icon: School },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <School className="size-5" />
          </div>
          <div>
            <p className="font-semibold leading-tight">SMK MVP ARS</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={<Link href={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <p className="text-xs text-muted-foreground">SMK MVP ARS</p>
      </SidebarFooter>
    </Sidebar>
  )
}
