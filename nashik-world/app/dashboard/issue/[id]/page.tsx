"use client"

import { use, useEffect, useState } from "react"
import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResolutionTimeline } from "@/components/resolution-timeline"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MessageCircle, ThumbsUp, Upload, X, Share2, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getIssueById, updateIssueStatus, verifyIssueResolution, updateIssue, deleteIssuePhoto, deleteIssue, addComment, subscribeToIssues, subscribeToComments } from "@/lib/issues"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { useAuth } from "@/components/auth-provider"
import { ImageViewer } from "@/components/image-viewer"
import { DeletePhotoDialog } from "@/components/delete-photo-dialog"
import { DeleteIssueDialog } from "@/components/delete-issue-dialog"
import type { Issue, IssueStatus, IssueComment } from "@/types/issue"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const resolvedParams = use(params)
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [updateComment, setUpdateComment] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [updating, setUpdating] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<{ url: string, index: number } | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [issueDeletingState, setIssueDeletingState] = useState(false)
  const [comments, setComments] = useState<IssueComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    async function loadIssue() {
      try {
        setLoading(true)
        const issueData = await getIssueById(resolvedParams.id)
        if (issueData) {
          setIssue(issueData)
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Issue not found"
          })
        }
      } catch (error) {
        console.error("Error loading issue:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load issue details. Please try refreshing the page."
        })
      } finally {
        setLoading(false)
      }
    }

    loadIssue()
  }, [resolvedParams.id, toast])

  useEffect(() => {
    const issueId = resolvedParams.id
    const unsubscribe = subscribeToIssues((issues) => {
      const currentIssue = issues.find(i => i.id === issueId)
      if (currentIssue) {
        setIssue(currentIssue)
      } else {
        toast({
          title: t("error"),
          description: t("issueNotFound"),
          variant: "destructive"
        })
        router.push('/dashboard')
      }
    })

    return () => unsubscribe()
  }, [resolvedParams.id, router, toast, t])

  useEffect(() => {
    const issueId = resolvedParams.id
    const unsubscribe = subscribeToComments(issueId, (newComments) => {
      setComments(newComments)
    })

    return () => unsubscribe()
  }, [resolvedParams.id])

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
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  const handleStatusChange = (newStatus: IssueStatus) => {
    if (!issue) return
    setIssue({ ...issue, status: newStatus })
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && selectedImages.length < 4) {
      setSelectedImages(prev => [...prev, ...Array.from(files)].slice(0, 4))
    }
    event.target.value = ""
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleShareIssue = async (issue: Issue) => {
    try {
      await navigator.share({
        title: `Civic Issue: ${t(issue.type)}`,
        text: `Check out this civic issue in ${issue.location}. Current status: ${issue.status}`,
        url: window.location.href
      })
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast({
          title: "Error",
          description: "Failed to share the issue. Try copying the URL manually.",
          variant: "destructive"
        })
      }
    }
  }

  const handleUpdateSubmit = async () => {
    if (!issue || (!updateComment && selectedImages.length === 0)) return
    
    try {
      setUpdating(true)
      let uploadedImages: string[] = []

      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(file => uploadToCloudinary(file))
        uploadedImages = await Promise.all(uploadPromises)
      }

      await updateIssueStatus(
        issue.id,
        issue.status,
        updateComment || "Status updated",
        uploadedImages
      )

      const updatedIssue = await getIssueById(issue.id)
      if (updatedIssue) {
        setIssue(updatedIssue)
      }

      setUpdateComment("")
      setSelectedImages([])

      toast({
        title: "Success",
        description: "Issue has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating issue:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the issue. Please try again."
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleVerifyResolution = async (issueId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please sign in to verify resolution."
      })
      return
    }

    try {
      setUpdating(true)
      await verifyIssueResolution(issueId, user.uid)
      
      const updatedIssue = await getIssueById(issueId)
      if (updatedIssue) {
        setIssue(updatedIssue)
      }

      toast({
        title: "Success",
        description: "Resolution verified successfully. Thank you for your contribution!"
      })
    } catch (error) {
      console.error("Error verifying resolution:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify resolution. Please try again."
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteImage = async (imageUrl: string, index: number) => {
    setImageToDelete({ url: imageUrl, index })
  }

  const confirmDeleteImage = async () => {
    if (!imageToDelete || !issue) return

    try {
      setIsDeleting(true)
      await deleteIssuePhoto(issue.id, imageToDelete.url, user?.uid)
      
      setIssue(prev => prev ? {
        ...prev,
        images: prev.images?.filter((url) => url !== imageToDelete.url) || []
      } : null)
      
      toast({
        title: t("success") || "Success",
        description: t("photoDeletedSuccess") || "Photo deleted successfully"
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: t("error") || "Error",
        description: error instanceof Error ? error.message : "Failed to delete photo. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setImageToDelete(null)
    }
  }

  const handleDeleteIssue = async () => {
    if (!issue) return
    
    try {
      setIssueDeletingState(true)
      await deleteIssue(issue.id)
      
      toast({
        title: t("success"),
        description: t("issueDeleted")
      })
      
      router.push('/dashboard')
    } catch (error) {
      console.error("Error deleting issue:", error)
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("issueDeleteError"),
        variant: "destructive"
      })
    } finally {
      setIssueDeletingState(false)
      setShowDeleteDialog(false)
    }
  }

  const handleAddComment = async () => {
    if (!issue || !newComment.trim() || !user) return
    
    try {
      setIsSubmittingComment(true)
      await addComment(issue.id, {
        content: newComment.trim(),
        author: {
          userId: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || undefined
        },
        likes: 0
      })
      
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("commentError"),
        variant: "destructive"
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-12 w-full bg-muted rounded animate-pulse" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div className="h-[200px] bg-muted rounded animate-pulse" />
              <div className="h-[300px] bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-[150px] bg-muted rounded animate-pulse" />
              <div className="h-[100px] bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Issue Not Found</h1>
          <p className="text-muted-foreground mb-4">The issue you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
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
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
              <CardDescription>
                Reported on {formatDate(issue.reportedOn)} by {issue.reportedBy?.name || "Anonymous"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-medium">Description</h3>
                <p className="text-sm">{issue.description}</p>
              </div>

              {issue.images && issue.images.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium">Photos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {issue.images.map((image, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-md border cursor-pointer"
                        onClick={() => {
                          setSelectedImageIndex(index)
                          setViewerOpen(true)
                        }}
                      >
                        <img
                          src={image}
                          alt={`Issue photo ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-2 font-medium">Location</h3>
                <div className="h-48 overflow-hidden rounded-md border bg-muted">
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-sm text-muted-foreground">
                      Map showing location at {issue.coordinates?.lat.toFixed(4)}, {issue.coordinates?.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="updates">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="comments">
                Comments {comments?.length ? `(${comments.length})` : ""}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="updates" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {issue.updates?.map((update, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <p className="text-sm">{update.comment}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{update.author || "System"}</span>
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
                    {comments?.length ? (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="rounded-lg border p-4">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
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
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">No comments yet</p>
                    )}

                    {user ? (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Add a comment</h3>
                        <Textarea 
                          placeholder="Write your comment here..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={handleAddComment}
                          disabled={isSubmittingComment || !newComment.trim()}
                        >
                          {isSubmittingComment ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">
                        Please sign in to add comments
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Current status and timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <ResolutionTimeline issue={issue} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select
                  onValueChange={(value) => handleStatusChange(value as IssueStatus)}
                  defaultValue={issue.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Update Comment</label>
                <Textarea
                  value={updateComment}
                  onChange={(e) => setUpdateComment(e.target.value)}
                  placeholder="Add details about the update..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Add Photos</label>
                {issue.images && issue.images.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground mb-2">Current Photos:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {issue.images.map((imageUrl, index) => (
                        <div key={`existing-${index}`} className="relative rounded-md overflow-hidden border aspect-square">
                          <img
                            src={imageUrl}
                            alt={`Issue photo ${index + 1}`}
                            className="h-full w-full object-cover cursor-pointer"
                            onClick={() => {
                              setSelectedImageIndex(index)
                              setViewerOpen(true)
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => handleDeleteImage(imageUrl, index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={`new-${index}`} className="relative rounded-md overflow-hidden border aspect-square">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Selected ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {selectedImages.length < 4 && (
                    <label className="flex items-center justify-center border-2 border-dashed rounded-md aspect-square cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-4 w-4" />
                        <span className="text-xs font-medium">Add New Photo</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedImages.length === 0 
                            ? "Up to 4 photos" 
                            : `${4 - selectedImages.length} remaining`}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}
                </div>
              </div>
              <Button 
                className="w-full" 
                disabled={(!updateComment && selectedImages.length === 0) || updating}
                onClick={handleUpdateSubmit}
              >
                {updating ? "Updating..." : "Submit Update"}
              </Button>

              <Separator />

              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => handleShareIssue(issue)}
              >
                <Share2 className="h-4 w-4" />
                Share Issue
              </Button>
              {issue.status === "resolved" && !issue.verified && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => handleVerifyResolution(issue.id)}
                  disabled={updating}
                >
                  <CheckCircle className="h-4 w-4" />
                  {updating ? "Verifying..." : "Verify Resolution"}
                </Button>
              )}
            </CardContent>
          </Card>

          {issue?.userId === user?.uid && (
            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Issue
                </Button>
              </CardContent>
            </Card>
          )}

          {issue.assignedTo && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">{t("assignedTo")}</p>
                  <p className="text-sm">{issue.assignedTo}</p>
                </div>
                {issue.estimatedResolution && (
                  <div>
                    <p className="text-sm font-medium">Estimated Resolution</p>
                    <p className="text-sm">{formatDate(issue.estimatedResolution)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {issue.images && issue.images.length > 0 && (
        <ImageViewer
          images={issue.images}
          initialIndex={selectedImageIndex}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}
      <DeletePhotoDialog 
        open={!!imageToDelete}
        onOpenChange={(open) => !open && setImageToDelete(null)}
        onConfirm={confirmDeleteImage}
        isDeleting={isDeleting}
      />
      <DeleteIssueDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteIssue}
        isDeleting={issueDeletingState}
      />
    </div>
  )
}
