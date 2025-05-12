"use client"

import { useState } from "react"
import { useTranslation } from "@/components/language-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter, List, Map, Search } from "lucide-react"
import { IssueMap } from "@/components/issue-map"

export default function DashboardPage() {
  const { t } = useTranslation()
  const [view, setView] = useState<"list" | "map">("list")
  const [showFilters, setShowFilters] = useState(false)

  // Mock data
  const issues = [
    {
      id: 1,
      type: "pothole",
      description: "Large pothole causing traffic issues",
      location: "Gangapur Road, near City Center Mall",
      status: "open",
      reportedOn: "2023-05-10T10:30:00",
      coordinates: { lat: 19.9975, lng: 73.7898 },
    },
    {
      id: 2,
      type: "waterLeak",
      description: "Water pipe leaking for past 3 days",
      location: "College Road, opposite ABB Circle",
      status: "inProgress",
      reportedOn: "2023-05-09T14:15:00",
      coordinates: { lat: 20.0025, lng: 73.7868 },
    },
    {
      id: 3,
      type: "fallenTree",
      description: "Tree fallen after yesterday's storm",
      location: "Mahatma Nagar, near Sharanpur Road",
      status: "resolved",
      reportedOn: "2023-05-08T09:45:00",
      coordinates: { lat: 19.9925, lng: 73.7938 },
    },
    {
      id: 4,
      type: "garbage",
      description: "Garbage not collected for a week",
      location: "Ashok Stambh, near Old CBS",
      status: "open",
      reportedOn: "2023-05-07T16:20:00",
      coordinates: { lat: 19.9985, lng: 73.7828 },
    },
    {
      id: 5,
      type: "streetlight",
      description: "Street light not working for past 5 days",
      location: "Satpur MIDC, near Ambad Link Road",
      status: "inProgress",
      reportedOn: "2023-05-06T11:10:00",
      coordinates: { lat: 20.0055, lng: 73.7798 },
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("issueDashboard")}</h1>
          <p className="text-muted-foreground">View and filter reported civic issues</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {t("filter")}
          </Button>
          <Tabs
            defaultValue="list"
            value={view}
            onValueChange={(v) => setView(v as "list" | "map")}
            className="hidden sm:block"
          >
            <TabsList>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                {t("issuesList")}
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2">
                <Map className="h-4 w-4" />
                {t("mapView")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Mobile view selector */}
      <div className="mb-4 sm:hidden">
        <Tabs defaultValue="list" value={view} onValueChange={(v) => setView(v as "list" | "map")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              {t("issuesList")}
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Map className="h-4 w-4" />
              {t("mapView")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="grid gap-4 p-4 sm:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("status")}</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">{t("open")}</SelectItem>
                  <SelectItem value="inProgress">{t("inProgress")}</SelectItem>
                  <SelectItem value="resolved">{t("resolved")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("category")}</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pothole">{t("pothole")}</SelectItem>
                  <SelectItem value="waterLeak">{t("waterLeak")}</SelectItem>
                  <SelectItem value="garbage">{t("garbage")}</SelectItem>
                  <SelectItem value="fallenTree">{t("fallenTree")}</SelectItem>
                  <SelectItem value="streetlight">{t("streetlight")}</SelectItem>
                  <SelectItem value="disaster">{t("disaster")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("radius")}</label>
              <div className="px-2">
                <Slider defaultValue={[5]} max={10} step={1} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search issues..." className="pl-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <div>
        {view === "list" ? (
          <div className="space-y-4">
            {issues.map((issue) => (
              <Card key={issue.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{t(issue.type)}</h3>
                        <Badge variant={getStatusBadgeVariant(issue.status) as any}>{t(issue.status)}</Badge>
                      </div>
                      <p className="text-sm">{issue.description}</p>
                      <p className="text-sm text-muted-foreground">{issue.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("reportedOn")}: {formatDate(issue.reportedOn)}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <a href={`/dashboard/issue/${issue.id}`}>{t("viewDetails")}</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <IssueMap issues={issues} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
