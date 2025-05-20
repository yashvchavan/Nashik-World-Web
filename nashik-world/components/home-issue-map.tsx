"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { subscribeToIssues } from "@/lib/issues"
import type { Issue, IssueType, IssueStatus, IssueUrgency, IssueUpdate } from "@/types/issue"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface MapIssue {
  id: string
  type: IssueType
  description: string
  location: string
  status: IssueStatus
  coordinates: {
    lat: number
    lng: number
  }
  reportedOn: string | Date
  urgency: IssueUrgency
  userId?: string
  verified?: boolean
  upvotes?: number
  updates?: IssueUpdate[]
}

export function HomeIssueMap() {
  const { t } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    categories: {
      pothole: true,
      waterLeak: true,
      garbage: true,
      fallenTree: true,
      streetlight: true,
      disaster: true,
    },
    status: "all" as "all" | IssueStatus,
    urgency: "all" as "all" | IssueUrgency,
  })
  const [issues, setIssues] = useState<MapIssue[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToIssues((newIssues: Issue[]) => {
      const mappedIssues = newIssues.map(issue => ({
        ...issue,
        reportedOn: issue.reportedOn,
        userId: issue.userId || '',
        verified: issue.verified || false,
        upvotes: issue.upvotes || 0,
        updates: issue.updates || [],
        urgency: issue.urgency || 'medium' // Default to medium if undefined
      }))
      setIssues(mappedIssues)
    })
    return () => unsubscribe()
  }, [])

  const handleSelectIssue = (issue: MapIssue) => {
    setSelectedIssue({
      ...issue,
      reportedOn: issue.reportedOn
    })
  }

  const filteredIssues = issues.filter((issue) => {
    if (issue.type !== "other" && !filters.categories[issue.type]) {
      return false
    }
    if (filters.status !== "all" && issue.status !== filters.status) {
      return false
    }
    if (filters.urgency !== "all" && issue.urgency !== filters.urgency) {
      return false
    }
    return true
  })

  const getMarkerColor = (issue: MapIssue) => {
    if (issue.status === "resolved") return "bg-green-500"

    switch (issue.type) {
      case "pothole": return "bg-amber-500"
      case "waterLeak": return "bg-blue-500"
      case "garbage": return "bg-green-600"
      case "fallenTree": return "bg-red-500"
      case "streetlight": return "bg-yellow-500"
      case "disaster": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  const getUrgencyBadge = (urgency: IssueUrgency) => {
    switch (urgency) {
      case "low": return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "medium": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "high": return "bg-red-100 text-red-800 hover:bg-red-100"
      default: return ""
    }
  }

  const getStatusBadgeVariant = (status: IssueStatus) => {
    switch (status) {
      case "open": return "default"
      case "inProgress": return "secondary"
      case "resolved": return "outline"
      default: return "secondary"
    }
  }

  const formatDate = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
    }).format(dateObj)
  }

  const handleCategoryChange = (category: IssueType, checked: boolean) => {
    setFilters({
      ...filters,
      categories: {
        ...filters.categories,
        [category]: checked,
      },
    })
  }

  const handleStatusChange = (status: "all" | IssueStatus) => {
    setFilters({
      ...filters,
      status,
    })
  }

  const handleUrgencyChange = (urgency: "all" | IssueUrgency) => {
    setFilters({
      ...filters,
      urgency,
    })
  }

  useEffect(() => {
    if (mapRef.current) {
      const mapElement = mapRef.current
      mapElement.innerHTML = ""

      const mapPlaceholder = document.createElement("div")
      mapPlaceholder.className = "relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"

      const mapWatermark = document.createElement("div")
      mapWatermark.className = "absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
      mapWatermark.textContent = "Nashik"
      mapWatermark.style.fontSize = "8rem"
      mapPlaceholder.appendChild(mapWatermark)

      filteredIssues.forEach((issue) => {
        const marker = document.createElement("button")
        marker.className = `absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${getMarkerColor(issue)} border-2 border-white shadow-md transition-all hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`

        const left = 10 + ((issue.coordinates.lng - 73.76) / 0.1) * 80
        const top = 10 + ((20.02 - issue.coordinates.lat) / 0.05) * 80

        marker.style.left = `${left}%`
        marker.style.top = `${top}%`

        if (issue.urgency === "high" && issue.status !== "resolved") {
          const pulse = document.createElement("div")
          pulse.className = `absolute w-6 h-6 rounded-full ${getMarkerColor(issue)} opacity-70 animate-ping`
          marker.appendChild(pulse)
        }

        marker.title = `${t(issue.type)}: ${issue.description}`
        marker.addEventListener("click", () => handleSelectIssue(issue))
        mapPlaceholder.appendChild(marker)
      })

      mapElement.appendChild(mapPlaceholder)
    }
  }, [filteredIssues, t])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Nashik Civic Issues Map</CardTitle>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {t("filter")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t("filter")} Issues</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium">{t("category")}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(filters.categories).map(([category, checked]) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={checked as boolean}
                          onCheckedChange={(isChecked) => 
                            handleCategoryChange(category as IssueType, isChecked as boolean)
                          }
                        />
                        <Label htmlFor={category}>{t(category)}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">{t("status")}</h3>
                  <RadioGroup
                    value={filters.status}
                    onValueChange={(value) => handleStatusChange(value as "all" | IssueStatus)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="status-all" />
                      <Label htmlFor="status-all">All</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="open" id="status-open" />
                      <Label htmlFor="status-open">{t("open")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inProgress" id="status-inProgress" />
                      <Label htmlFor="status-inProgress">{t("inProgress")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="resolved" id="status-resolved" />
                      <Label htmlFor="status-resolved">{t("resolved")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">Urgency</h3>
                  <RadioGroup
                    value={filters.urgency}
                    onValueChange={(value) => handleUrgencyChange(value as "all" | IssueUrgency)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="urgency-all" />
                      <Label htmlFor="urgency-all">All</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="urgency-low" />
                      <Label htmlFor="urgency-low">Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="urgency-medium" />
                      <Label htmlFor="urgency-medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="urgency-high" />
                      <Label htmlFor="urgency-high">High</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Tabs defaultValue="map" className="hidden sm:block">
            <TabsList>
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapRef} className="h-[400px] w-full" />

          {selectedIssue && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card rounded-lg shadow-lg border p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getMarkerColor(selectedIssue)}`}></div>
                  <h3 className="font-medium">{t(selectedIssue.type)}</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedIssue(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm">{selectedIssue.description}</p>
                <p className="text-xs text-muted-foreground">{selectedIssue.location}</p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant={getStatusBadgeVariant(selectedIssue.status)}>
                    {t(selectedIssue.status)}
                  </Badge>
                  <Badge variant="outline" className={getUrgencyBadge(selectedIssue.urgency)}>
                    {selectedIssue.urgency} urgency
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  {t("reportedOn")}: {formatDate(selectedIssue.reportedOn)}
                </p>

                <Button asChild size="sm" className="w-full mt-2">
                  <Link href={`/dashboard/issue/${selectedIssue.id}`}>{t("viewDetails")}</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg shadow-sm border p-2 text-xs">
            <div className="font-medium mb-1">Legend</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                { type: "pothole", color: "bg-amber-500" },
                { type: "waterLeak", color: "bg-blue-500" },
                { type: "garbage", color: "bg-green-600" },
                { type: "fallenTree", color: "bg-red-500" },
                { type: "streetlight", color: "bg-yellow-500" },
                { type: "disaster", color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span>{t(item.type)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg shadow-sm border p-2 text-xs">
            <div className="font-medium">
              {filteredIssues.length} {filteredIssues.length === 1 ? "issue" : "issues"} displayed
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}