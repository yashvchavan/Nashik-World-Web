"use client"

import Link from "next/link"
import { AlertTriangle, ArrowRight, BarChart3 } from "lucide-react"
import { LanguageProvider, useTranslation } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { IssueStats } from "@/components/issue-stats"
import { RecentIssues } from "@/components/recent-issues"
import { HomeIssueMap } from "@/components/home-issue-map"

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  )
}

function HomeContent() {
  const { t } = useTranslation()
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 text-center md:p-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">{t("heroTitle")}</h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">{t("heroSubtitle")}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/report">
                <AlertTriangle className="h-5 w-5" />
                {t("reportNow")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/dashboard">
                <BarChart3 className="h-5 w-5" />
                {t("viewDashboard")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Issue Map Section */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">Issue Map</h2>
        <HomeIssueMap />
      </section>

      {/* Features Section */}
      <section className="mb-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">{t("reportIssue")}</h2>
            <p className="text-muted-foreground">Report civic issues with photos and location</p>
            <Button asChild variant="link" className="mt-4">
              <Link href="/report" className="flex items-center gap-1">
                Report <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">{t("transparencyDashboard")}</h2>
            <p className="text-muted-foreground">Track issue status, assignments, and timelines</p>
            <Button asChild variant="link" className="mt-4">
              <Link href="/transparency" className="flex items-center gap-1">
                View <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold">{t("civicPoints")}</h2>
            <p className="text-muted-foreground">Earn points and compete on the leaderboard</p>
            <Button asChild variant="link" className="mt-4">
              <Link href="/gamification" className="flex items-center gap-1">
                Explore <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Stats and Recent Issues */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <IssueStats />
        </div>
        <div className="md:col-span-2">
          <RecentIssues />
        </div>
      </div>
    </div>
  )
}