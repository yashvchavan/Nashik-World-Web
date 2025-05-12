"use client"

import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, CheckCircle2, Edit, Upload } from "lucide-react"

export default function ProfilePage() {
  const { t } = useTranslation()

  // Mock data
  const user = {
    name: "Rajesh Patil",
    email: "rajesh.patil@example.com",
    avatar: "/placeholder.svg?height=100&width=100",
    points: 320,
    issuesReported: 12,
    issuesResolved: 8,
    verifications: 5,
  }

  const userIssues = [
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
      resolvedOn: "2023-05-11T16:30:00",
      verified: false,
    },
    {
      id: 4,
      type: "garbage",
      location: "Ashok Stambh, near Old CBS",
      status: "resolved",
      reportedOn: "2023-05-01T16:20:00",
      resolvedOn: "2023-05-05T11:45:00",
      verified: true,
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
      <div className="grid gap-6 md:grid-cols-3">
        {/* User Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Change avatar</span>
                </Button>
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center">
                <div className="rounded-lg p-2">
                  <p className="text-2xl font-bold">{user.points}</p>
                  <p className="text-xs text-muted-foreground">{t("pointsEarned")}</p>
                </div>
                <div className="rounded-lg p-2">
                  <p className="text-2xl font-bold">{user.issuesReported}</p>
                  <p className="text-xs text-muted-foreground">Reported</p>
                </div>
                <div className="rounded-lg p-2">
                  <p className="text-2xl font-bold">{user.verifications}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
              </div>

              <Button className="mt-6 w-full gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Issues */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("yourIssues")}</CardTitle>
            <CardDescription>Track and verify your reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4 grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {userIssues.map((issue) => (
                  <div key={issue.id} className="rounded-lg border p-4 transition-colors hover:bg-accent">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{t(issue.type)}</h3>
                          <Badge variant={getStatusBadgeVariant(issue.status) as any}>{t(issue.status)}</Badge>
                          {issue.status === "resolved" && issue.verified && (
                            <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("reportedOn")}: {formatDate(issue.reportedOn)}
                        </p>
                        {issue.resolvedOn && (
                          <p className="text-xs text-muted-foreground">Resolved on: {formatDate(issue.resolvedOn)}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {issue.status === "resolved" && !issue.verified && (
                          <Button size="sm" className="gap-1">
                            <Upload className="h-3 w-3" />
                            {t("verifyResolution")}
                          </Button>
                        )}
                        <Button asChild size="sm" variant="outline">
                          <a href={`/dashboard/issue/${issue.id}`}>{t("viewDetails")}</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                {userIssues
                  .filter((issue) => issue.status !== "resolved")
                  .map((issue) => (
                    <div key={issue.id} className="rounded-lg border p-4 transition-colors hover:bg-accent">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                          <a href={`/dashboard/issue/${issue.id}`}>{t("viewDetails")}</a>
                        </Button>
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="resolved" className="space-y-4">
                {userIssues
                  .filter((issue) => issue.status === "resolved")
                  .map((issue) => (
                    <div key={issue.id} className="rounded-lg border p-4 transition-colors hover:bg-accent">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{t(issue.type)}</h3>
                            <Badge variant={getStatusBadgeVariant(issue.status) as any}>{t(issue.status)}</Badge>
                            {issue.verified && (
                              <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.location}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("reportedOn")}: {formatDate(issue.reportedOn)}
                          </p>
                          {issue.resolvedOn && (
                            <p className="text-xs text-muted-foreground">Resolved on: {formatDate(issue.resolvedOn)}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!issue.verified && (
                            <Button size="sm" className="gap-1">
                              <Upload className="h-3 w-3" />
                              {t("verifyResolution")}
                            </Button>
                          )}
                          <Button asChild size="sm" variant="outline">
                            <a href={`/dashboard/issue/${issue.id}`}>{t("viewDetails")}</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
