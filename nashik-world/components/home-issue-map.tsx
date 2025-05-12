"use client"

import Link from "next/link"

import { useState, useEffect, useRef } from "react"
import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Define issue types
type IssueStatus = "open" | "inProgress" | "resolved"
type IssueUrgency = "low" | "medium" | "high"
type IssueCategory = "pothole" | "waterLeak" | "garbage" | "fallenTree" | "streetlight" | "disaster"

interface Issue {
  id: number
  type: IssueCategory
  description: string
  location: string
  status: IssueStatus
  urgency: IssueUrgency
  reportedOn: string
  coordinates: {
    lat: number
    lng: number
  }
}

export function HomeIssueMap() {
  const { t } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
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

  // Mock data for issues in Nashik
  const issues: Issue[] = [
    {
      id: 1,
      type: "pothole",
      description: "Large pothole causing traffic issues",
      location: "Gangapur Road, near City Center Mall",
      status: "open",
      urgency: "high",
      reportedOn: "2023-05-10T10:30:00",
      coordinates: { lat: 19.9975, lng: 73.7898 },
    },
    {
      id: 2,
      type: "waterLeak",
      description: "Water pipe leaking for past 3 days",
      location: "College Road, opposite ABB Circle",
      status: "inProgress",
      urgency: "medium",
      reportedOn: "2023-05-09T14:15:00",
      coordinates: { lat: 20.0025, lng: 73.7868 },
    },
    {
      id: 3,
      type: "fallenTree",
      description: "Tree fallen after yesterday's storm",
      location: "Mahatma Nagar, near Sharanpur Road",
      status: "resolved",
      urgency: "high",
      reportedOn: "2023-05-08T09:45:00",
      coordinates: { lat: 19.9925, lng: 73.7938 },
    },
    {
      id: 4,
      type: "garbage",
      description: "Garbage not collected for a week",
      location: "Ashok Stambh, near Old CBS",
      status: "open",
      urgency: "medium",
      reportedOn: "2023-05-07T16:20:00",
      coordinates: { lat: 19.9985, lng: 73.7828 },
    },
    {
      id: 5,
      type: "streetlight",
      description: "Street light not working for past 5 days",
      location: "Satpur MIDC, near Ambad Link Road",
      status: "inProgress",
      urgency: "low",
      reportedOn: "2023-05-06T11:10:00",
      coordinates: { lat: 20.0055, lng: 73.7798 },
    },
    {
      id: 6,
      type: "disaster",
      description: "Road damaged due to heavy rain",
      location: "Mumbai Naka, near Dwarka Circle",
      status: "open",
      urgency: "high",
      reportedOn: "2023-05-05T08:30:00",
      coordinates: { lat: 19.9935, lng: 73.7758 },
    },
    {
      id: 7,
      type: "pothole",
      description: "Multiple potholes on the road",
      location: "Nashik Road, near Railway Station",
      status: "open",
      urgency: "medium",
      reportedOn: "2023-05-04T13:45:00",
      coordinates: { lat: 19.9845, lng: 73.8098 },
    },
    {
      id: 8,
      type: "waterLeak",
      description: "Major water leak from main pipeline",
      location: "Cidco, near Trimbak Naka",
      status: "inProgress",
      urgency: "high",
      reportedOn: "2023-05-03T09:20:00",
      coordinates: { lat: 20.0105, lng: 73.7698 },
    },
  ]

  // Filter issues based on selected filters
  const filteredIssues = issues.filter((issue) => {
    // Filter by category
    if (!filters.categories[issue.type]) return false

    // Filter by status
    if (filters.status !== "all" && issue.status !== filters.status) return false

    // Filter by urgency
    if (filters.urgency !== "all" && issue.urgency !== filters.urgency) return false

    return true
  })

  // Handle category filter change
  const handleCategoryChange = (category: IssueCategory, checked: boolean) => {
    setFilters({
      ...filters,
      categories: {
        ...filters.categories,
        [category]: checked,
      },
    })
  }

  // Handle status filter change
  const handleStatusChange = (status: "all" | IssueStatus) => {
    setFilters({
      ...filters,
      status,
    })
  }

  // Handle urgency filter change
  const handleUrgencyChange = (urgency: "all" | IssueUrgency) => {
    setFilters({
      ...filters,
      urgency,
    })
  }

  // Get marker color based on issue type and status
  const getMarkerColor = (issue: Issue) => {
    if (issue.status === "resolved") return "bg-green-500"

    switch (issue.type) {
      case "pothole":
        return "bg-amber-500"
      case "waterLeak":
        return "bg-blue-500"
      case "garbage":
        return "bg-green-600"
      case "fallenTree":
        return "bg-red-500"
      case "streetlight":
        return "bg-yellow-500"
      case "disaster":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get urgency badge variant
  const getUrgencyBadge = (urgency: IssueUrgency) => {
    switch (urgency) {
      case "low":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  // Get status badge variant
  const getStatusBadge = (status: IssueStatus) => {
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  // Create a simple map with markers
  useEffect(() => {
    if (mapRef.current) {
      const mapElement = mapRef.current
      mapElement.innerHTML = ""

      // Create a placeholder map
      const mapPlaceholder = document.createElement("div")
      mapPlaceholder.className = "relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"

      // Add a watermark for Nashik
      const mapWatermark = document.createElement("div")
      mapWatermark.className = "absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
      mapWatermark.textContent = "Nashik"
      mapWatermark.style.fontSize = "8rem"
      mapPlaceholder.appendChild(mapWatermark)

      // Add markers for filtered issues
      filteredIssues.forEach((issue) => {
        const marker = document.createElement("button")
        marker.className = `absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${getMarkerColor(issue)} border-2 border-white shadow-md transition-all hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`

        // Position markers based on coordinates (normalized to the map size)
        // This is a simplified positioning - in a real map API, you'd use actual geo coordinates
        const left = 10 + ((issue.coordinates.lng - 73.76) / 0.1) * 80 // Normalize longitude to 10-90% of map width
        const top = 10 + ((20.02 - issue.coordinates.lat) / 0.05) * 80 // Normalize latitude to 10-90% of map height

        marker.style.left = `${left}%`
        marker.style.top = `${top}%`

        // Add pulse effect for high urgency issues
        if (issue.urgency === "high" && issue.status !== "resolved") {
          const pulse = document.createElement("div")
          pulse.className = `absolute w-6 h-6 rounded-full ${getMarkerColor(issue)} opacity-70 animate-ping`
          marker.appendChild(pulse)
        }

        // Add tooltip on hover
        marker.title = `${t(issue.type)}: ${issue.description}`

        // Add click event to show issue details
        marker.addEventListener("click", () => {
          setSelectedIssue(issue)
        })

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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pothole"
                        checked={filters.categories.pothole}
                        onCheckedChange={(checked) => handleCategoryChange("pothole", checked as boolean)}
                      />
                      <Label htmlFor="pothole">{t("pothole")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="waterLeak"
                        checked={filters.categories.waterLeak}
                        onCheckedChange={(checked) => handleCategoryChange("waterLeak", checked as boolean)}
                      />
                      <Label htmlFor="waterLeak">{t("waterLeak")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="garbage"
                        checked={filters.categories.garbage}
                        onCheckedChange={(checked) => handleCategoryChange("garbage", checked as boolean)}
                      />
                      <Label htmlFor="garbage">{t("garbage")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fallenTree"
                        checked={filters.categories.fallenTree}
                        onCheckedChange={(checked) => handleCategoryChange("fallenTree", checked as boolean)}
                      />
                      <Label htmlFor="fallenTree">{t("fallenTree")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="streetlight"
                        checked={filters.categories.streetlight}
                        onCheckedChange={(checked) => handleCategoryChange("streetlight", checked as boolean)}
                      />
                      <Label htmlFor="streetlight">{t("streetlight")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="disaster"
                        checked={filters.categories.disaster}
                        onCheckedChange={(checked) => handleCategoryChange("disaster", checked as boolean)}
                      />
                      <Label htmlFor="disaster">{t("disaster")}</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">{t("status")}</h3>
                  <RadioGroup
                    defaultValue={filters.status}
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
                    defaultValue={filters.urgency}
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
          {/* Map View */}
          <div ref={mapRef} className="h-[400px] w-full" />

          {/* Selected Issue Popup */}
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
                  <Badge variant={getStatusBadge(selectedIssue.status) as any}>{t(selectedIssue.status)}</Badge>
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

          {/* Map Legend */}
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg shadow-sm border p-2 text-xs">
            <div className="font-medium mb-1">Legend</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>{t("pothole")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>{t("waterLeak")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span>{t("garbage")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>{t("fallenTree")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>{t("streetlight")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>{t("disaster")}</span>
              </div>
            </div>
          </div>

          {/* Issue Count */}
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
