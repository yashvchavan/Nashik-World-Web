import { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { RootLayoutClient } from "./layout-client"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NashikWorld - Report Civic Issues",
  description: "A platform for citizens of Nashik to report and track civic issues",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <RootLayoutClient inter={inter.className}>
        {children}
      </RootLayoutClient>
    </html>
  )
}
