"use client"

import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function IssueStats() {
  const { t } = useTranslation()

  // Mock data
  const stats = {
    total: 124,
    open: 45,
    inProgress: 32,
    resolved: 47,
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
              {stats.open} ({Math.round((stats.open / stats.total) * 100)}%)
            </span>
          </div>
          <Progress value={(stats.open / stats.total) * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("inProgress")}</span>
            <span className="text-sm text-muted-foreground">
              {stats.inProgress} ({Math.round((stats.inProgress / stats.total) * 100)}%)
            </span>
          </div>
          <Progress
            value={(stats.inProgress / stats.total) * 100}
            className="h-2 bg-orange-100 dark:bg-orange-950"
            indicatorClassName="bg-orange-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("resolved")}</span>
            <span className="text-sm text-muted-foreground">
              {stats.resolved} ({Math.round((stats.resolved / stats.total) * 100)}%)
            </span>
          </div>
          <Progress
            value={(stats.resolved / stats.total) * 100}
            className="h-2 bg-green-100 dark:bg-green-950"
            indicatorClassName="bg-green-500"
          />
        </div>
      </CardContent>
    </Card>
  )
}
