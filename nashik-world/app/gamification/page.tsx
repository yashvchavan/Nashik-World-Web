"use client"

import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Trophy, Users } from "lucide-react"

export default function GamificationPage() {
  const { t } = useTranslation()

  // Mock data
  const userPoints = {
    total: 320,
    level: 3,
    nextLevel: 400,
    rank: 5,
  }

  const leaderboard = [
    { id: 1, name: "Rahul Sharma", points: 520, avatar: "/placeholder.svg?height=40&width=40" },
    { id: 2, name: "Priya Patel", points: 480, avatar: "/placeholder.svg?height=40&width=40" },
    { id: 3, name: "Amit Deshmukh", points: 450, avatar: "/placeholder.svg?height=40&width=40" },
    { id: 4, name: "Sneha Joshi", points: 410, avatar: "/placeholder.svg?height=40&width=40" },
    { id: 5, name: "You", points: 320, avatar: "/placeholder.svg?height=40&width=40", isCurrentUser: true },
    { id: 6, name: "Vikram Singh", points: 290, avatar: "/placeholder.svg?height=40&width=40" },
    { id: 7, name: "Neha Kulkarni", points: 260, avatar: "/placeholder.svg?height=40&width=40" },
  ]

  const upcomingDrives = [
    {
      id: 1,
      title: "Nashik River Cleanup",
      date: "2023-05-20T09:00:00",
      location: "Godavari Riverbank, Ramkund",
      participants: 24,
      pointsReward: 50,
    },
    {
      id: 2,
      title: "Tree Plantation Drive",
      date: "2023-05-27T08:30:00",
      location: "Pandavleni Hills",
      participants: 18,
      pointsReward: 40,
    },
    {
      id: 3,
      title: "Road Safety Awareness",
      date: "2023-06-03T10:00:00",
      location: "College Road",
      participants: 12,
      pointsReward: 30,
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("gamification")}</h1>

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
                  {userPoints.level}
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-bold">{userPoints.total}</h3>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Level {userPoints.level}</span>
                <span>Level {userPoints.level + 1}</span>
              </div>
              <Progress value={(userPoints.total / userPoints.nextLevel) * 100} className="h-2" />
              <p className="text-center text-xs text-muted-foreground">
                {userPoints.nextLevel - userPoints.total} points to next level
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-sm">
                City Rank: <span className="font-bold">#{userPoints.rank}</span>
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
              {leaderboard.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between rounded-lg p-2 ${
                    user.isCurrentUser ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      #{user.id}
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
                <div key={drive.id} className="rounded-lg border p-3 transition-colors hover:bg-accent">
                  <h3 className="font-medium">{drive.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(drive.date)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
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
