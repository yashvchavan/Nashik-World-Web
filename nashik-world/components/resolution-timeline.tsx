"use client"

import { useTranslation } from "@/components/language-provider"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface Issue {
  id: number
  type: string
  location: string
  status: string
  reportedOn: string
  assignedTo: string
  estimatedResolution: string
  startedOn?: string
  resolvedOn?: string
}

interface ResolutionTimelineProps {
  issue: Issue
}

export function ResolutionTimeline({ issue }: ResolutionTimelineProps) {
  const { t } = useTranslation()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">Issue Reported</p>
          <p className="text-sm text-muted-foreground">{formatDate(issue.reportedOn)}</p>
        </div>
      </div>

      <div className="ml-3.5 h-6 w-px bg-border" />

      <div className="flex items-start gap-3">
        {issue.startedOn ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
            <Clock className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Clock className="h-4 w-4" />
          </div>
        )}
        <div>
          <p className={`font-medium ${!issue.startedOn && "text-muted-foreground"}`}>Work Started</p>
          {issue.startedOn ? (
            <p className="text-sm text-muted-foreground">{formatDate(issue.startedOn)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Pending</p>
          )}
        </div>
      </div>

      <div className="ml-3.5 h-6 w-px bg-border" />

      <div className="flex items-start gap-3">
        {issue.resolvedOn ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
        <div>
          <p className={`font-medium ${!issue.resolvedOn && "text-muted-foreground"}`}>Issue Resolved</p>
          {issue.resolvedOn ? (
            <p className="text-sm text-muted-foreground">{formatDate(issue.resolvedOn)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Estimated: {formatDate(issue.estimatedResolution)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
