"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Trophy, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getUserProfile, getLeaderboard, getUserRank } from "@/lib/user"
import { calculateLevel } from "@/lib/constants"
import { useToast } from "@/components/ui/use-toast"
import type { UserProfile } from "@/types/user"

interface LeaderboardUser {
  id: string
  name: string
  points: number
  avatar?: string
  rank: number
  isCurrentUser?: boolean
}

export default function GamificationPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return

      try {
        setLoading(true)
        const [userProfile, leaderboard] = await Promise.all([
          getUserProfile(user.uid),
          getLeaderboard(10)
        ])

        if (userProfile) {
          setProfile(userProfile)
          // Get user's rank
          const rank = await getUserRank(user.uid, userProfile.points)
          
          // Add ranks to leaderboard users
          const usersWithRanks = leaderboard.map((u, index) => ({
            ...u,
            rank: index + 1,
            isCurrentUser: u.id === user.uid
          }))

          // If user is not in top 10, add them at the end
          if (!usersWithRanks.some(u => u.id === user.uid)) {
            usersWithRanks.push({
              id: user.uid,
              name: userProfile.name,
              points: userProfile.points,
              avatar: userProfile.avatar,
              rank,
              isCurrentUser: true
            })
          }

          setLeaderboardUsers(usersWithRanks)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data. Please try again."
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.uid, toast])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please sign in to view your civic points and achievements.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="md:col-span-1">
              <CardContent className="p-6">
                <div className="h-32 w-full animate-pulse rounded-lg bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const { level, nextLevel, progress } = calculateLevel(profile.points)

  // Mock data for upcoming drives - In a real app, this would come from the backend
  const upcomingDrives = [
    {
      id: 1,
      title: "Nashik River Cleanup",
      date: "2025-05-20T09:00:00",
      location: "Godavari Riverbank, Ramkund",
      participants: 24,
      pointsReward: 50,
    },
    {
      id: 2,
      title: "Tree Plantation Drive",
      date: "2025-05-25T08:00:00",
      location: "College Road Green Belt",
      participants: 18,
      pointsReward: 30,
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-3">
        {/* User Civic Points */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("civicPoints")}</CardTitle>
            <CardDescription>Your contribution to Nashik</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-12 w-12 text-primary" />
                <div className="absolute -top-2 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {level}
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-bold">{profile.points}</h3>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Level {level}</span>
                <span>Level {level + 1}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-xs text-muted-foreground">
                {nextLevel - profile.points} points to next level
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-sm">
                City Rank: <span className="font-bold">#{leaderboardUsers.find(u => u.isCurrentUser)?.rank || "N/A"}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                View Badges
              </Button>
              <Button variant="outline" size="sm">
                Point History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("leaderboard")}</CardTitle>
            <CardDescription>Top contributors this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between rounded-lg p-2 ${
                    user.isCurrentUser ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      #{user.rank}
                    </div>
                    <Avatar>
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className={user.isCurrentUser ? "font-bold" : ""}>{user.name}</span>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {user.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Community Drives */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("upcomingDrives")}</CardTitle>
            <CardDescription>Join and earn extra points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDrives.map((drive) => (
                <div key={drive.id} className="space-y-2 rounded-lg border p-3">
                  <h3 className="font-semibold">{drive.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(drive.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{drive.location}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs">
                      <Users className="h-3 w-3" />
                      <span>{drive.participants} joined</span>
                    </div>
                    <Badge>+{drive.pointsReward} pts</Badge>
                  </div>
                  <Button size="sm" className="mt-3 w-full">
                    Join Drive
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
