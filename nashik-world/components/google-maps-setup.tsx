"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, Settings } from "lucide-react"

export function GoogleMapsSetup() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Nashik Civic Issues Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Google Maps Setup Required</h3>
            <p className="text-muted-foreground mb-4">
              To display the interactive map with Nashik civic issues, you need to configure Google Maps API.
            </p>
          </div>
          <div className="space-y-3 text-sm text-left bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium">Setup Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Get a Google Maps API key from Google Cloud Console</li>
              <li>Enable Maps JavaScript API</li>
              <li>Create a <code className="bg-background px-1 rounded">.env.local</code> file</li>
              <li>Add your API key: <code className="bg-background px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here</code></li>
              <li>Restart your development server</li>
            </ol>
          </div>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline" size="sm">
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Get API Key
              </a>
            </Button>
            <Button asChild size="sm">
              <a href="/GOOGLE_MAPS_SETUP.md" target="_blank" rel="noopener noreferrer">
                View Full Guide
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 