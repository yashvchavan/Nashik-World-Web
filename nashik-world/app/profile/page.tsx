"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, CheckCircle2, Upload, WifiOff } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getUserProfile, createUserProfile } from "@/lib/user"
import { getUserIssues, verifyIssueResolution } from "@/lib/issues"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { IssueSkeleton } from "@/components/issue-skeleton"
import { useToast } from "@/components/ui/use-toast"
import type { UserProfile } from "@/types/user"
import type { Issue } from "@/types/issue"

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [issuesLoading, setIssuesLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine)

  // Handle online/offline status
  useEffect(() => {
    function handleOnline() {
      setIsOffline(false)
      // Reload data when coming back online
      loadProfile()
      loadIssues()
      toast({
        title: "Back Online",
        description: "You're connected to the internet again.",
      })
    }

    function handleOffline() {
      setIsOffline(true)
      toast({
        variant: "destructive",
        title: "You're Offline",
        description: "Some features may be unavailable. Please check your connection.",
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [toast])

  // Load profile data
  async function loadProfile() {
    if (!user?.uid || isOffline) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const userProfile = await getUserProfile(user.uid)
      if (userProfile) {
        setProfile(userProfile)
      } else {
        const newProfile = await createUserProfile(user.uid, {
          name: user.displayName || "",
          email: user.email || "",
          avatar: user.photoURL || "",
        })
        setProfile(newProfile)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: isOffline 
          ? "Unable to load profile while offline. Please check your connection." 
          : "Failed to load profile. Please try refreshing the page."
      })
    } finally {
      setLoading(false)
    }
  }

  // Load profile on mount or when user changes
  useEffect(() => {
    loadProfile()
  }, [user?.uid, isOffline])

  // Load issues data
  async function loadIssues() {
    if (!user?.uid || isOffline) {
      setIssuesLoading(false)
      return
    }

    try {
      setIssuesLoading(true)
      const userIssues = await getUserIssues(user.uid)
      setIssues(userIssues)
    } catch (error) {
      console.error("Error loading issues:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: isOffline 
          ? "Unable to load issues while offline. Please check your connection."
          : "Failed to load issues. Please try refreshing the page."
      })
    } finally {
      setIssuesLoading(false)
    }
  }

  // Load issues on mount or when user changes
  useEffect(() => {
    loadIssues()
  }, [user?.uid, isOffline])

  const handleVerifyResolution = useCallback(async (issueId: string) => {
    if (!user) return

    try {
      setVerifying(issueId)
      await verifyIssueResolution(issueId, user.uid)
      
      // Refresh profile and issues
      const [updatedProfile, updatedIssues] = await Promise.all([
        getUserProfile(user.uid),
        getUserIssues(user.uid)
      ])
      
      if (updatedProfile) setProfile(updatedProfile)
      setIssues(updatedIssues)
      
      toast({
        title: "Success",
        description: "Issue resolution verified successfully!"
      })
    } catch (error) {
      console.error("Error verifying resolution:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify resolution. Please try again."
      })
    } finally {
      setVerifying(null)
    }
  }, [user, toast])

  const handleProfileUpdate = useCallback(async () => {
    if (!user?.uid) return
    try {
      setLoading(true)
      const updatedProfile = await getUserProfile(user.uid)
      if (updatedProfile) {
        setProfile(updatedProfile)
        toast({
          title: "Success",
          description: "Profile updated successfully!"
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh profile. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }, [user?.uid, toast])

  const filteredIssues = useMemo(() => {
    switch (activeTab) {
      case "active":
        return issues.filter(issue => issue.status !== "resolved")
      case "resolved":
        return issues.filter(issue => issue.status === "resolved")
      default:
        return issues
    }
  }, [issues, activeTab])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default"
      case "inProgress":
        return "secondary"
      case "resolved":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Show offline state
  if (isOffline) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <WifiOff className="h-12 w-12 text-muted-foreground" />
              <div>
                <h2 className="text-xl font-bold mb-2">You're Offline</h2>
                <p className="text-muted-foreground mb-4">
                  Please check your internet connection and try again.
                </p>
                <Button 
                  onClick={() => {
                    if (window.navigator.onLine) {
                      setIsOffline(false)
                      loadProfile()
                      loadIssues()
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
                <div className="mt-4 h-6 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar || ""} alt={profile?.name} />
                  <AvatarFallback className="text-2xl">
                    {profile?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-bold">{profile?.name}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>

              <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center">
                <div className="rounded-lg p-2">
                  <p className="text-2xl font-bold">{profile?.points || 0}</p>
                  <p className="text-xs text-muted-foreground">{t("pointsEarned")}</p>
                </div>
                <div className="rounded-lg p-2">
                  <p className="text-2xl font-bold">{profile?.issuesReported || 0}</p>
                  <p className="text-xs text-muted-foreground">Reported</p>
                </div>
                <div className="rounded-lg p-2">
                  <p className="text-2xl font-bold">{profile?.verifications || 0}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
              </div>

              <EditProfileDialog
                name={profile?.name || ""}
                email={profile?.email || ""}
                avatar={profile?.avatar || ""}
                onUpdate={handleProfileUpdate}
              />
            </div>
          </CardContent>
        </Card>

        {/* Issues Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("yourIssues")}</CardTitle>
            <CardDescription>Track and verify your reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              {issuesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <IssueSkeleton key={n} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIssues.map((issue) => (
                    <div key={issue.id} className="rounded-lg border p-4 transition-colors hover:bg-accent">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{t(issue.type)}</h3>
                            <Badge variant={getStatusBadgeVariant(issue.status)}>{t(issue.status)}</Badge>
                            {issue.verified && (
                              <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.location}</p>
                          <p className="text-xs text-muted-foreground">
                            Reported on: {issue.reportedOn.toLocaleDateString()}
                          </p>
                          {issue.resolvedOn && (
                            <p className="text-xs text-muted-foreground">
                              Resolved on: {issue.resolvedOn.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {issue.status === "resolved" && !issue.verified && (
                            <Button 
                              size="sm" 
                              className="gap-1"
                              onClick={() => handleVerifyResolution(issue.id)}
                              disabled={verifying === issue.id}
                            >
                              <Upload className="h-3 w-3" />
                              {verifying === issue.id ? "Verifying..." : t("verifyResolution")}
                            </Button>
                          )}
                          <Button asChild size="sm" variant="outline">
                            <a href={`/dashboard/issue/${issue.id}`}>{t("viewDetails")}</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredIssues.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No issues found in this category
                    </div>
                  )}
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
