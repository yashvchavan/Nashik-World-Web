"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Home, AlertTriangle, BarChart3, Map, Trophy, User, LogOut, LogIn, HeartHandshake, Users } from "lucide-react"
import { useTranslation } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { AuthDialog } from "@/components/auth-dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppSidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  const navItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/report", label: t("reportIssue"), icon: AlertTriangle },
    { href: "/dashboard", label: t("issueDashboard"), icon: Map },
    { href: "/transparency", label: t("transparencyDashboard"), icon: BarChart3 },
    { href: "/drives", label: t("communityDrives"), icon: Users },
    { href: "/gamification", label: t("gamification"), icon: Trophy },
    ...(user ? [{ href: "/profile", label: t("profile"), icon: User }] : []),
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="NashikFix Logo" width={200} height={200} />
          
        </Link>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        {user ? (
          <Button variant="outline" className="w-full justify-start" onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("logout")}
          </Button>
        ) : (
          <AuthDialog />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
