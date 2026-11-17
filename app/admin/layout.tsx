import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { getAuthenticatedUser } from "@/lib/auth"

import ProfileDropdown from "./profile-dropdown"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/")
  }

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
          <ProfileDropdown nama={user.fullname} email={user.email} />
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </SidebarProvider>
  )
}
