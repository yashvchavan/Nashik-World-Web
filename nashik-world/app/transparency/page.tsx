"use client"

import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResolutionTimeline } from "@/components/resolution-timeline"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Issue } from "@/types/issue"

export default function TransparencyPage() {
  const { t } = useTranslation()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchIssues() {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, "issues"))
      const issuesData = querySnapshot.docs.map(doc => {
        const data = doc.data()
        // Convert Firestore Timestamps to JS Dates for Issue type
        return {
          id: doc.id,
          ...data,
          reportedOn: data.reportedOn?.toDate ? data.reportedOn.toDate() : data.reportedOn,
          resolvedOn: data.resolvedOn?.toDate ? data.resolvedOn.toDate() : data.resolvedOn,
          estimatedResolution: data.estimatedResolution?.toDate ? data.estimatedResolution.toDate() : data.estimatedResolution,
          updates: data.updates?.map((u: any) => ({ ...u, date: u.date?.toDate ? u.date.toDate() : u.date })) ?? [],
        } as Issue
      })
      setIssues(issuesData)
      setLoading(false)
    }
    fetchIssues()
  }, [])

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
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("transparencyDashboard")}</h1>

      <Tabs defaultValue="table">
        <TabsList className="mb-6">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Issue Resolution Tracking</CardTitle>
              <CardDescription>
                Track the status, assignments, and resolution timelines of reported issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">{t("issueType")}</TableHead>
                      <TableHead className="w-[200px]">{t("location")}</TableHead>
                      <TableHead className="w-[100px]">{t("status")}</TableHead>
                      <TableHead className="w-[150px]">{t("assignedTo")}</TableHead>
                      <TableHead className="w-[120px]">{t("reportedOn")}</TableHead>
                      <TableHead className="w-[120px]">Est. Resolution</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium">{t(issue.type)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{issue.location}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(issue.status) as any}>{t(issue.status)}</Badge>
                        </TableCell>
                        <TableCell>{issue.assignedTo}</TableCell>
                        <TableCell>{formatDate(typeof issue.reportedOn === 'string' ? issue.reportedOn : (issue.reportedOn ? issue.reportedOn.toISOString() : ''))}</TableCell>
                        <TableCell>{issue.estimatedResolution ? formatDate(typeof issue.estimatedResolution === 'string' ? issue.estimatedResolution : issue.estimatedResolution.toISOString()) : '-'}</TableCell>
                        <TableCell>
                          <Button asChild size="sm" variant="outline">
                            <a href={`/dashboard/issue/${issue.id}`}>{t("viewDetails")}</a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="grid gap-6 md:grid-cols-2">
            {issues.map((issue) => (
              <Card key={issue.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t(issue.type)}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(issue.status) as any}>{t(issue.status)}</Badge>
                  </div>
                  <CardDescription>{issue.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm">
                      <span className="font-medium">{t("assignedTo")}:</span> {issue.assignedTo}
                    </p>
                  </div>
                  <ResolutionTimeline issue={issue} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
