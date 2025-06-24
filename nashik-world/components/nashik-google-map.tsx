"use client"

import { useState, useEffect, useRef } from "react"
import { Wrapper, Status } from "@googlemaps/react-wrapper"
import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Filter, X, MapPin, AlertTriangle, Droplets, Trash2, Tree, Lightbulb, Zap } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { subscribeToIssues } from "@/lib/issues"
import type { Issue, IssueType, IssueStatus, IssueUrgency, IssueUpdate } from "@/types/issue"
import { GoogleMapsSetup } from "./google-maps-setup"

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

// Nashik coordinates (center of the city)
const NASHIK_CENTER = { lat: 19.9975, lng: 73.7898 }

// Custom marker icons for different issue types
const getMarkerIcon = (type: IssueType, status: IssueStatus) => {
  const baseIcon = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${status === 'resolved' ? '#10b981' : getTypeColor(type)}" stroke="white" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${getTypeIcon(type)}</text>
      </svg>
    `),
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16)
  }
  return baseIcon
}

const getTypeColor = (type: IssueType): string => {
  switch (type) {
    case "pothole": return "#f59e0b"
    case "waterLeak": return "#3b82f6"
    case "garbage": return "#059669"
    case "fallenTree": return "#ef4444"
    case "streetlight": return "#eab308"
    case "disaster": return "#8b5cf6"
    default: return "#6b7280"
  }
}

const getTypeIcon = (type: IssueType): string => {
  switch (type) {
    case "pothole": return "🕳️"
    case "waterLeak": return "💧"
    case "garbage": return "🗑️"
    case "fallenTree": return "🌳"
    case "streetlight": return "💡"
    case "disaster": return "⚠️"
    default: return "📍"
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

function MapComponent({ issues, onIssueSelect, center }: { issues: MapIssue[], onIssueSelect: (issue: MapIssue) => void, center: { lat: number, lng: number } }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      })
      mapInstanceRef.current = map
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center)
    }
  }, [center])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add new markers
    issues.forEach(issue => {
      const marker = new google.maps.Marker({
        position: { lat: issue.coordinates.lat, lng: issue.coordinates.lng },
        map: mapInstanceRef.current,
        icon: getMarkerIcon(issue.type, issue.status),
        title: `${issue.type}: ${issue.description}`,
        animation: issue.urgency === "high" && issue.status !== "resolved" 
          ? google.maps.Animation.BOUNCE 
          : undefined
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${issue.type}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px;">${issue.description}</p>
            <p style="margin: 0; font-size: 12px; color: #666;">${issue.location}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">Status: ${issue.status}</p>
          </div>
        `
      })

      marker.addListener("click", () => {
        onIssueSelect(issue)
        infoWindow.open(mapInstanceRef.current, marker)
      })

      markersRef.current.push(marker)
    })
  }, [issues, onIssueSelect])

  return <div ref={mapRef} className="w-full h-[500px] rounded-lg" />
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <div className="w-full h-[500px] rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">Loading map...</div>
    case Status.FAILURE:
      return <div className="w-full h-[500px] rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">Error loading map</div>
    default:
      return null
  }
}

interface NashikGoogleMapProps {
  filteredIssues?: Issue[]
  showFilters?: boolean
  className?: string
}

export function NashikGoogleMap({ filteredIssues, showFilters = true, className = "" }: NashikGoogleMapProps) {
  const { t } = useTranslation()
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
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
    if (filteredIssues) {
      const mappedIssues = filteredIssues.map(issue => ({
        ...issue,
        reportedOn: issue.reportedOn,
        userId: issue.userId || '',
        verified: issue.verified || false,
        upvotes: issue.upvotes || 0,
        updates: issue.updates || [],
        urgency: issue.urgency || 'medium'
      }))
      setIssues(mappedIssues)
    } else {
      // Use real-time Firebase data
      const unsubscribe = subscribeToIssues((firebaseIssues) => {
        const mapped = firebaseIssues.map(issue => ({
          ...issue,
          reportedOn: issue.reportedOn,
          userId: issue.userId || '',
          verified: issue.verified || false,
          upvotes: issue.upvotes || 0,
          updates: issue.updates || [],
          urgency: issue.urgency || 'medium'
        }))
        setIssues(mapped)
      })
      return () => unsubscribe()
    }
  }, [filteredIssues])

  const handleSelectIssue = (issue: MapIssue) => {
    setSelectedIssue(issue)
  }

  const finalFilteredIssues = issues.filter((issue) => {
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

  // Center map on Nashik or on the first issue if only one is provided
  const mapCenter = finalFilteredIssues.length === 1
    ? finalFilteredIssues[0].coordinates
    : NASHIK_CENTER

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

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Nashik Civic Issues Map</CardTitle>
        {showFilters && (
          <div className="flex gap-2">
            <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Issues</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Issue Types</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(filters.categories).map(([category, checked]) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={checked}
                            onCheckedChange={(checked) => 
                              handleCategoryChange(category as IssueType, checked as boolean)
                            }
                          />
                          <Label htmlFor={category} className="text-sm">
                            {t(category)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <RadioGroup
                      value={filters.status}
                      onValueChange={(value) => handleStatusChange(value as "all" | IssueStatus)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="status-all" />
                        <Label htmlFor="status-all" className="text-sm">All</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="open" id="status-open" />
                        <Label htmlFor="status-open" className="text-sm">Open</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inProgress" id="status-inProgress" />
                        <Label htmlFor="status-inProgress" className="text-sm">In Progress</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="resolved" id="status-resolved" />
                        <Label htmlFor="status-resolved" className="text-sm">Resolved</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Urgency</Label>
                    <RadioGroup
                      value={filters.urgency}
                      onValueChange={(value) => handleUrgencyChange(value as "all" | IssueUrgency)}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="urgency-all" />
                        <Label htmlFor="urgency-all" className="text-sm">All</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="urgency-low" />
                        <Label htmlFor="urgency-low" className="text-sm">Low</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="urgency-medium" />
                        <Label htmlFor="urgency-medium" className="text-sm">Medium</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="urgency-high" />
                        <Label htmlFor="urgency-medium" className="text-sm">High</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <GoogleMapsSetup />
        ) : (
          <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} render={render}>
            <MapComponent issues={finalFilteredIssues} onIssueSelect={handleSelectIssue} center={mapCenter} />
          </Wrapper>
        )}
        
        {selectedIssue && (
          <div className="p-4 border-t">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getStatusBadgeVariant(selectedIssue.status)}>
                    {selectedIssue.status}
                  </Badge>
                  <Badge className={getUrgencyBadge(selectedIssue.urgency)}>
                    {selectedIssue.urgency}
                  </Badge>
                  {selectedIssue.verified && (
                    <Badge variant="outline" className="text-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{t(selectedIssue.type)}</h3>
                <p className="text-sm text-muted-foreground mb-2">{selectedIssue.description}</p>
                <p className="text-sm text-muted-foreground mb-2">{selectedIssue.location}</p>
                <p className="text-xs text-muted-foreground">
                  Reported: {formatDate(selectedIssue.reportedOn)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIssue(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 