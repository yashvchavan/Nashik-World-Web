"use client"

import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function RecentIssues() {
  const { t } = useTranslation()

  // Mock data
  const recentIssues = [
    {
      id: 1,
      type: "pothole",
      location: "Gangapur Road, near City Center Mall",
      status: "open",
      reportedOn: "2023-05-10T10:30:00",
    },
    {
      id: 2,
      type: "waterLeak",
      location: "College Road, opposite ABB Circle",
      status: "inProgress",
      reportedOn: "2023-05-09T14:15:00",
    },
    {
      id: 3,
      type: "fallenTree",
      location: "Mahatma Nagar, near Sharanpur Road",
      status: "resolved",
      reportedOn: "2023-05-08T09:45:00",
    },
  ]

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default"
      case "inProgress":
        return "warning"
      case "resolved":
        return "success"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
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
        <div className="space-y-4">
          {recentIssues.map((issue) => (
            <div
              key={issue.id}
              className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{t(issue.type)}</h3>
                  <Badge variant={getStatusBadgeVariant(issue.status) as any}>{t(issue.status)}</Badge>
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
      </CardContent>
    </Card>
  )
}
