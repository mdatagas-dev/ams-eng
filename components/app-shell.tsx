"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  RiArchiveLine,
  RiDashboardLine,
  RiExchangeBoxLine,
  RiHistoryLine,
  RiQrCodeLine,
  RiLogoutBoxRLine,
  RiPulseLine,
  RiTeamLine,
} from "@remixicon/react"

import { logout } from "@/app/(workspace)/logout-action"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import type { AuthUser } from "@/lib/auth-types"

const navigation = [
  { href: "/", label: "Dashboard", icon: RiDashboardLine },
  { href: "/assets", label: "Asset Register", icon: RiArchiveLine },
  { href: "/borrowings", label: "Borrowing", icon: RiExchangeBoxLine },
  { href: "/inventory", label: "Cabinet Inventory", icon: RiQrCodeLine },
  { href: "/history", label: "Activity History", icon: RiHistoryLine },
]

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: AuthUser
}) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <RiPulseLine />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">Asset Management</p>
              <p className="truncate font-mono text-[0.625rem] tracking-wider text-sidebar-foreground/55 uppercase">
                Engineering + IT
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarGroupContent>
              <AppNavigation role={user.role} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
          <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-medium">{user.name}</p>
              <p className="text-[0.6875rem] text-sidebar-foreground/55">
                {user.role === "SUPER_USER" ? "Super user" : "Admin"}
              </p>
            </div>
            <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
              <ThemeToggle />
              <form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  className="size-11 sm:size-8"
                  aria-label="Sign out"
                >
                  <RiLogoutBoxRLine />
                </Button>
              </form>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset id="main-content" tabIndex={-1}>
        <div className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4 md:hidden">
          <SidebarTrigger />
          <span className="ml-3 text-sm font-semibold">Asset Management</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[92.5rem] flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppNavigation({ role }: { role: AuthUser["role"] }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const items =
    role === "SUPER_USER"
      ? [...navigation, { href: "/users", label: "Users", icon: RiTeamLine }]
      : navigation

  return (
    <nav aria-label="Primary navigation">
      <SidebarMenu>
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpenMobile(false)}
                  />
                }
                isActive={active}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </nav>
  )
}
