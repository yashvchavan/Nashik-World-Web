"use client"

import { useState, useEffect } from "react"
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
import { subscribeToIssues } from "@/lib/issues"
import type { Issue } from "@/types/issue"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { t } = useTranslation()
  const [view, setView] = useState<"list" | "map">("list")
  const [showFilters, setShowFilters] = useState(false)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    radius: 5,
    search: ""
  })

  useEffect(() => {
    const unsubscribe = subscribeToIssues((newIssues) => {
      setIssues(newIssues)
      setLoading(false)
    })

    return () => unsubscribe()
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

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  const filteredIssues = issues
    .filter((issue) =>
      filters.status === "all" ? true : issue.status === filters.status
    )
    .filter((issue) =>
      filters.category === "all" ? true : issue.type === filters.category
    )
    .filter((issue) =>
      filters.search
        ? issue.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          issue.location.toLowerCase().includes(filters.search.toLowerCase())
        : true
    )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-12 w-full bg-muted rounded animate-pulse" />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-[200px] bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
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
              <Select 
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
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
              <Select 
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
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
                <Slider 
                  defaultValue={[5]} 
                  value={[filters.radius]}
                  onValueChange={([value]) => setFilters(prev => ({ ...prev, radius: value }))}
                  max={10} 
                  step={1} 
                />
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
                <Input 
                  placeholder="Search issues..." 
                  className="pl-8" 
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {view === "list" ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredIssues.map((issue) => (
            <Card key={issue.id} className="relative overflow-hidden">
              {issue.images && issue.images.length > 0 && (
                <div className="relative h-48">
                  <img
                    src={issue.images[0]}
                    alt={t(issue.type)}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {issue.images.length > 1 && (
                    <Badge variant="secondary" className="absolute bottom-2 right-2">
                      +{issue.images.length - 1}
                    </Badge>
                  )}
                </div>
              )}
              <Link href={`/dashboard/issue/${issue.id}`}>
                <CardContent className={cn(
                  "p-6 space-y-4",
                  !issue.images?.length && "pt-6"
                )}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{t(issue.type)}</Badge>
                      <Badge variant={getStatusBadgeVariant(issue.status) as any}>{t(issue.status)}</Badge>
                    </div>
                    <h3 className="font-semibold leading-tight">{issue.location}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {issue.reportedBy?.avatar ? (
                        <img
                          src={issue.reportedBy.avatar}
                          alt={issue.reportedBy.name}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : null}
                      <span>{issue.reportedBy?.name || "Anonymous"}</span>
                    </div>
                    <time dateTime={issue.reportedOn.toString()}>{formatDate(issue.reportedOn)}</time>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <IssueMap issues={filteredIssues} />
      )}
    </div>
  )
}
