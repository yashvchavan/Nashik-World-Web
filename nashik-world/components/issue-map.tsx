"use client"

import { useEffect, useRef } from "react"
import { useTranslation } from "@/components/language-provider"

import type { Issue as FirestoreIssue } from "@/types/issue"

interface IssueMapProps {
  issues: FirestoreIssue[]
}

export function IssueMap({ issues }: { issues: FirestoreIssue[] }) {
  const { t } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // This is a placeholder for the actual map implementation
    // In a real application, you would use a library like Leaflet or Google Maps
    if (mapRef.current) {
      const mapElement = mapRef.current
      mapElement.innerHTML = ""

      // Create a simple placeholder map
      const mapPlaceholder = document.createElement("div")
      mapPlaceholder.className = "relative w-full h-full bg-gray-100 dark:bg-gray-800"

      // Add a message
      const mapMessage = document.createElement("div")
      mapMessage.className = "absolute inset-0 flex items-center justify-center text-center p-4"
      mapMessage.textContent =
        "Map view would display issues across Nashik here. Integration with mapping libraries like Leaflet or Google Maps would be implemented in production."

      // Add markers for each issue
      issues.forEach((issue) => {
        const marker = document.createElement("div")
        marker.className = "absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2"

        // Position markers randomly for the placeholder
        const left = 10 + Math.random() * 80 // 10-90%
        const top = 10 + Math.random() * 80 // 10-90%

        // Color based on status
        let bgColor = "bg-primary"
        if (issue.status === "inProgress") bgColor = "bg-orange-500"
        if (issue.status === "resolved") bgColor = "bg-green-500"

        marker.className = `absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${bgColor}`
        marker.style.left = `${left}%`
        marker.style.top = `${top}%`

        // Add pulse effect
        const pulse = document.createElement("div")
        pulse.className = `absolute w-4 h-4 rounded-full ${bgColor} opacity-75 animate-ping`
        marker.appendChild(pulse)

        // Add tooltip on hover
        marker.title = `${t(issue.type)}: ${issue.description}`

        mapPlaceholder.appendChild(marker)
      })

      mapPlaceholder.appendChild(mapMessage)
      mapElement.appendChild(mapPlaceholder)
    }
  }, [issues, t])

  return (
    <div ref={mapRef} className="h-[500px] w-full">
      {/* Map will be rendered here */}
    </div>
  )
}
