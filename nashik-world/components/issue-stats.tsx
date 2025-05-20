"use client"

import { useEffect, useState, useMemo } from "react"
import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { subscribeToIssues } from "@/lib/issues"
import type { Issue } from "@/types/issue"

export function IssueStats() {
  const { t } = useTranslation()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  // Subscribe to real-time issue updates
  useEffect(() => {
    const unsubscribe = subscribeToIssues((newIssues) => {
      setIssues(newIssues)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const stats = useMemo(() => {
    const total = issues.length
    const open = issues.filter(i => i.status === 'open').length
    const inProgress = issues.filter(i => i.status === 'inProgress').length
    const resolved = issues.filter(i => i.status === 'resolved').length
    return { total, open, inProgress, resolved }
  }, [issues])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-40 bg-muted rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-2 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("status")}</CardTitle>
        <CardDescription>Current issue statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("open")}</span>
            <span className="text-sm text-muted-foreground">
              {stats.open} ({stats.total ? Math.round((stats.open / stats.total) * 100) : 0}%)
            </span>
          </div>
          <Progress 
            value={stats.total ? (stats.open / stats.total) * 100 : 0} 
            className="h-2" 
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("inProgress")}</span>
            <span className="text-sm text-muted-foreground">
              {stats.inProgress} ({stats.total ? Math.round((stats.inProgress / stats.total) * 100) : 0}%)
            </span>
          </div>
          <Progress
            value={stats.total ? (stats.inProgress / stats.total) * 100 : 0}
            className="h-2 bg-orange-100 dark:bg-orange-950"
            indicatorClassName="bg-orange-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("resolved")}</span>
            <span className="text-sm text-muted-foreground">
              {stats.resolved} ({stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%)
            </span>
          </div>
          <Progress
            value={stats.total ? (stats.resolved / stats.total) * 100 : 0}
            className="h-2 bg-green-100 dark:bg-green-950"
            indicatorClassName="bg-green-500"
          />
        </div>
      </CardContent>
    </Card>
  )
}
