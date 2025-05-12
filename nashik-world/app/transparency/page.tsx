"use client"

import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResolutionTimeline } from "@/components/resolution-timeline"

export default function TransparencyPage() {
  const { t } = useTranslation()

  // Mock data
  const issues = [
    {
      id: 1,
      type: "pothole",
      location: "Gangapur Road, near City Center Mall",
      status: "open",
      reportedOn: "2023-05-10T10:30:00",
      assignedTo: "Road Department",
      estimatedResolution: "2023-05-15",
    },
    {
      id: 2,
      type: "waterLeak",
      location: "College Road, opposite ABB Circle",
      status: "inProgress",
      reportedOn: "2023-05-09T14:15:00",
      assignedTo: "Water Department",
      estimatedResolution: "2023-05-14",
      startedOn: "2023-05-10T09:00:00",
    },
    {
      id: 3,
      type: "fallenTree",
      location: "Mahatma Nagar, near Sharanpur Road",
      status: "resolved",
      reportedOn: "2023-05-08T09:45:00",
      assignedTo: "Garden Department",
      estimatedResolution: "2023-05-12",
      startedOn: "2023-05-08T14:00:00",
      resolvedOn: "2023-05-11T16:30:00",
    },
    {
      id: 4,
      type: "garbage",
      location: "Ashok Stambh, near Old CBS",
      status: "open",
      reportedOn: "2023-05-07T16:20:00",
      assignedTo: "Sanitation Department",
      estimatedResolution: "2023-05-13",
    },
    {
      id: 5,
      type: "streetlight",
      location: "Satpur MIDC, near Ambad Link Road",
      status: "inProgress",
      reportedOn: "2023-05-06T11:10:00",
      assignedTo: "Electrical Department",
      estimatedResolution: "2023-05-12",
      startedOn: "2023-05-07T10:00:00",
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
                        <TableCell>{formatDate(issue.reportedOn)}</TableCell>
                        <TableCell>{formatDate(issue.estimatedResolution)}</TableCell>
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
