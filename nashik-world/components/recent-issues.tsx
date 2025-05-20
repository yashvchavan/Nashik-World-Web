"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { getAllIssues } from "@/lib/issues"
import type { Issue } from "@/types/issue"

export function RecentIssues() {
  const { t } = useTranslation()
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getAllIssues()
      .then((issues) => {
        setRecentIssues(issues.slice(0, 5)) // Show 5 most recent issues
        setLoading(false)
        setError(null)
      })
      .catch((err) => {
        setError(err.message || "Failed to load issues")
        setLoading(false)
      })
  }, [])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default"
      case "inProgress":
        return "secondary"
      case "resolved":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("issuesList")}</CardTitle>
          <CardDescription>Recently reported issues</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard" className="flex items-center gap-1">
            {t("viewDashboard")} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="h-20 rounded-lg border bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted-foreground">
            {error}
          </div>
        ) : recentIssues.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No issues reported yet
          </div>
        ) : (
          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{t(issue.type)}</h3>
                    <Badge variant={getStatusBadgeVariant(issue.status)}>{t(issue.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{issue.location}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("reportedOn")}: {formatDate(issue.reportedOn)}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/issue/${issue.id}`}>{t("viewDetails")}</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}