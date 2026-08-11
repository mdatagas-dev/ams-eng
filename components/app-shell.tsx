"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  RiArchiveLine,
  RiDashboardLine,
  RiExchangeBoxLine,
  RiHistoryLine,
  RiLogoutBoxRLine,
  RiTeamLine,
} from "@remixicon/react"

import { logout } from "@/app/(workspace)/logout-action"
import { useI18n } from "@/components/i18n-provider"
import { LanguageToggle } from "@/components/language-toggle"
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

function AppNavigation({ role }: { role: AuthUser["role"] }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const { t } = useI18n()
  const navigation = [
    { href: "/", label: t("navDashboard"), icon: RiDashboardLine },
    { href: "/assets", label: t("navAssets"), icon: RiArchiveLine },
    { href: "/borrowings", label: t("navBorrowings"), icon: RiExchangeBoxLine },
    { href: "/history", label: t("navHistory"), icon: RiHistoryLine },
  ]
  const items =
    role === "SUPER_USER"
      ? [...navigation, { href: "/users", label: t("navUsers"), icon: RiTeamLine }]
      : navigation

  return (
    <nav aria-label={t("primaryNavigation")}>
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

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: AuthUser
}) {
  const { t } = useI18n()

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
      >
        {t("skipToContent")}
      </a>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">{t("appTitle")}</p>
              <p className="truncate font-mono text-[0.625rem] tracking-wider text-sidebar-foreground/55 uppercase">
                Engineering + IT
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("operations")}</SidebarGroupLabel>
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
                {user.role === "SUPER_USER" ? t("roleSuperUser") : t("roleAdmin")}
              </p>
            </div>
            <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
              <LanguageToggle />
              <ThemeToggle />
              <form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  className="size-11 sm:size-8"
                  aria-label={t("signOut")}
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
          <span className="ml-3 text-sm font-semibold">{t("appTitle")}</span>
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
