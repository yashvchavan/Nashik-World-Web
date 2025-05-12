"use client"

import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResolutionTimeline } from "@/components/resolution-timeline"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MessageCircle, ThumbsUp, Upload } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const { t } = useTranslation()
  const issueId = Number.parseInt(params.id)

  // Mock data - in a real app, fetch this based on the ID
  const issue = {
    id: issueId,
    type: "pothole",
    description:
      "Large pothole causing traffic issues and damage to vehicles. It's approximately 2 feet wide and 8 inches deep. During rain, it fills with water and becomes invisible to drivers.",
    location: "Gangapur Road, near City Center Mall",
    coordinates: { lat: 19.9975, lng: 73.7898 },
    status: "inProgress",
    reportedOn: "2023-05-10T10:30:00",
    reportedBy: {
      name: "Rajesh Patil",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    assignedTo: "Road Department",
    estimatedResolution: "2023-05-15",
    startedOn: "2023-05-11T09:00:00",
    photos: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
    updates: [
      {
        id: 1,
        date: "2023-05-10T14:45:00",
        content: "Issue has been assigned to Road Department",
        author: "System",
      },
      {
        id: 2,
        date: "2023-05-11T09:15:00",
        content: "Work has started on fixing the pothole. We expect to complete it by May 15.",
        author: "Road Department",
      },
    ],
    comments: [
      {
        id: 1,
        date: "2023-05-10T11:30:00",
        content: "I've seen multiple vehicles get damaged because of this pothole. Please fix it soon!",
        author: {
          name: "Priya Sharma",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        likes: 5,
      },
      {
        id: 2,
        date: "2023-05-10T16:45:00",
        content: "This pothole has been there for over a month now. It's getting worse with each rainfall.",
        author: {
          name: "Amit Deshmukh",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        likes: 3,
      },
    ],
  }

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
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/dashboard" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t(issue.type)}</h1>
            <p className="text-muted-foreground">{issue.location}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(issue.status) as any} className="w-fit">
            {t(issue.status)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Issue Details */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
              <CardDescription>
                Reported on {formatDate(issue.reportedOn)} by {issue.reportedBy.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-medium">Description</h3>
                <p className="text-sm">{issue.description}</p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {issue.photos.map((photo, index) => (
                    <div key={index} className="overflow-hidden rounded-md border">
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Issue photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Location</h3>
                <div className="h-48 overflow-hidden rounded-md border bg-muted">
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-sm text-muted-foreground">
                      Map showing location at {issue.coordinates.lat.toFixed(4)}, {issue.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Updates and Comments */}
          <Tabs defaultValue="updates">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="comments">Comments ({issue.comments.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="updates" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {issue.updates.map((update) => (
                      <div key={update.id} className="rounded-lg border p-4">
                        <p className="text-sm">{update.content}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{update.author}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(update.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {issue.comments.map((comment) => (
                        <div key={comment.id} className="rounded-lg border p-4">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage
                                src={comment.author.avatar || "/placeholder.svg"}
                                alt={comment.author.name}
                              />
                              <AvatarFallback>
                                {comment.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{comment.author.name}</h4>
                                <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                              </div>
                              <p className="mt-1 text-sm">{comment.content}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs">
                                  <ThumbsUp className="h-3 w-3" />
                                  Like ({comment.likes})
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs">
                                  <MessageCircle className="h-3 w-3" />
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Add a comment</h3>
                      <Textarea placeholder="Write your comment here..." />
                      <Button size="sm" className="mt-2">
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-1 space-y-6">
          {/* Status and Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Current status and timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <ResolutionTimeline issue={issue} />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full gap-2">
                <Upload className="h-4 w-4" />
                Add Photo
              </Button>
              <Button variant="outline" className="w-full">
                Share Issue
              </Button>
              {issue.status === "resolved" && (
                <Button variant="outline" className="w-full">
                  Verify Resolution
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">{t("assignedTo")}</p>
                <p className="text-sm">{issue.assignedTo}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Estimated Resolution</p>
                <p className="text-sm">{formatDate(issue.estimatedResolution)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
