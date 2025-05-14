"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { LanguageProvider } from "@/components/language-provider"
import { AuthProvider } from "@/components/auth-provider"

interface RootLayoutClientProps {
  children: React.ReactNode
  inter: string
}

export function RootLayoutClient({ children, inter }: RootLayoutClientProps) {
  return (
    <body className={inter}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <LanguageProvider>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1 overflow-x-hidden w-full">{children}</main>
              </div>
            </SidebarProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </body>
  )
}
