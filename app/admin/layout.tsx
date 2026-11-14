import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import ProfileDropdown from "./profile-dropdown"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="min-h-svh min-w-0 flex-1 bg-muted/30">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">Panel Admin</p>
              <p className="text-xs text-muted-foreground">
                SMK MVP ARS Internasional
              </p>
            </div>
          </div>
          <ProfileDropdown />
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </SidebarProvider>
  )
}
