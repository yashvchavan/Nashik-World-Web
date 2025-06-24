"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateDriveModal } from "@/components/create-drive-modal"
import { Calendar, MapPin, Users, Clock, Plus, Share2, Heart, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { subscribeToDrives, joinDrive, deleteDrive } from "@/lib/drives"
import { Drive } from "@/types/drive"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function DrivesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [drives, setDrives] = useState<Drive[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [driveToDelete, setDriveToDelete] = useState<Drive | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToDrives((fetchedDrives) => {
      setDrives(fetchedDrives)
      setLoading(false)
    });
    return () => unsubscribe()
  }, [])

  const upcomingDrives = drives.filter((drive) => drive.status === "upcoming")
  const completedDrives = drives.filter((drive) => drive.status === "completed")
  const myDrives = user ? drives.filter(drive => drive.participants.includes(user.uid) || drive.organizer.userId === user.uid) : []

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "cleanup": return "bg-green-100 text-green-800 hover:bg-green-100"
      case "plantation": return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
      case "awareness": return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "maintenance": return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric", minute: "numeric", hour12: true,
    }).format(date)
  }

  const handleJoinDrive = async (driveId: string) => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be signed in to join a drive.", variant: "destructive" });
      return;
    }
    try {
      await joinDrive(driveId, user.uid);
      toast({ title: "Successfully Joined!", description: "You've joined the drive. Thanks for your participation!" });
    } catch (error) {
      toast({ title: "Error Joining Drive", description: (error as Error).message, variant: "destructive" });
    }
  }

  const handleDeleteDrive = async () => {
    if (!driveToDelete) return
    setIsDeleting(true)
    try {
      await deleteDrive(driveToDelete.id)
      toast({ title: "Drive Deleted", description: "The drive has been deleted successfully." })
      setDrives(prev => prev.filter(d => d.id !== driveToDelete.id))
      setShowDeleteDialog(false)
      setDriveToDelete(null)
    } catch (error) {
      toast({ title: "Error Deleting Drive", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }
  
  const renderDriveCard = (drive: Drive, isCompleted = false) => (
    <Card key={drive.id} className={`overflow-hidden ${isCompleted ? 'opacity-75' : ''}`}>
      {drive.imageUrl && <img src={drive.imageUrl} alt={drive.title} className="w-full h-48 object-cover"/>}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{drive.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(drive.category)}>{drive.category}</Badge>
              {isCompleted ? <Badge variant="secondary">Completed</Badge> : <Badge variant="outline">+{drive.pointsReward || 0} pts</Badge>}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{drive.description}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{formatDate(drive.date)}</span></div>
          <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" /><span>{formatTime(drive.date)}</span></div>
          <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="line-clamp-1">{drive.location}</span></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6"><AvatarImage src={drive.organizer.avatar || "/placeholder.svg"} alt={drive.organizer.name} /><AvatarFallback className="text-xs">{drive.organizer.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
            <span className="text-xs text-muted-foreground">{drive.organizer.name}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {isCompleted ? `${drive.participantCount} participated` : `${drive.participantCount}/${drive.maxParticipants || '∞'}`}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {!isCompleted ? (
            <Button className="flex-1" onClick={() => handleJoinDrive(drive.id)} disabled={drive.participants.includes(user?.uid || '') || (drive.maxParticipants ? drive.participantCount >= drive.maxParticipants : false)}>
              {drive.participants.includes(user?.uid || '') ? "Joined" : (drive.maxParticipants && drive.participantCount >= drive.maxParticipants) ? "Full" : "Join Drive"}
            </Button>
          ) : null}
          <Button variant="outline" className="flex-1" onClick={() => setSelectedDrive(drive)}>Details</Button>
          {user && drive.organizer.userId === user.uid && (
            <Button variant="destructive" onClick={() => { setDriveToDelete(drive); setShowDeleteDialog(true); }} disabled={isDeleting}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderSkeleton = (key: number) => (
    <Card key={key} className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardContent className="space-y-4 pt-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
        </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-bold">{t("communityDrives")}</h1><p className="text-muted-foreground">Join community initiatives and earn civic points</p></div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Create Drive</Button>
      </div>
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList><TabsTrigger value="upcoming">Upcoming Drives ({upcomingDrives.length})</TabsTrigger><TabsTrigger value="completed">Completed ({completedDrives.length})</TabsTrigger><TabsTrigger value="my-drives">My Drives ({myDrives.length})</TabsTrigger></TabsList>
        <TabsContent value="upcoming" className="space-y-6">
          {loading ? <div className="grid gap-6 md:grid-cols-2">{[...Array(2)].map((_, i) => renderSkeleton(i))}</div> : 
            (upcomingDrives.length > 0 ? <div className="grid gap-6 md:grid-cols-2">{upcomingDrives.map(drive => renderDriveCard(drive, false))}</div> : <p>No upcoming drives.</p>)
          }
        </TabsContent>
        <TabsContent value="completed" className="space-y-6">
          {loading ? <div className="grid gap-6 md:grid-cols-2">{[...Array(2)].map((_, i) => renderSkeleton(i))}</div> :
            (completedDrives.length > 0 ? <div className="grid gap-6 md:grid-cols-2">{completedDrives.map(drive => renderDriveCard(drive, true))}</div> : <p>No completed drives.</p>)
          }
        </TabsContent>
        <TabsContent value="my-drives" className="space-y-6">
          {loading ? <div className="grid gap-6 md:grid-cols-2">{[...Array(2)].map((_, i) => renderSkeleton(i))}</div> :
            (myDrives.length === 0 ? <Card><CardContent className="flex flex-col items-center justify-center py-12"><Users className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-medium mb-2">You haven't joined or created any drives yet.</h3><p className="text-muted-foreground text-center mb-4">Start organizing or participating in community drives to make a difference in Nashik.</p><Button onClick={() => setIsCreateModalOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Create Your First Drive</Button></CardContent></Card> :
            <div className="grid gap-6 md:grid-cols-2">{myDrives.map(drive => renderDriveCard(drive, drive.status === 'completed'))}</div>)
          }
        </TabsContent>
      </Tabs>

      {selectedDrive && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in-0" onClick={() => setSelectedDrive(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between"><div className="space-y-2"><CardTitle className="text-xl">{selectedDrive.title}</CardTitle><div className="flex items-center gap-2"><Badge className={getCategoryColor(selectedDrive.category)}>{selectedDrive.category}</Badge><Badge variant="outline">+{selectedDrive.pointsReward || 0} pts</Badge>{selectedDrive.status === "completed" && <Badge variant="secondary">Completed</Badge>}</div></div><Button variant="ghost" size="icon" onClick={() => setSelectedDrive(null)}><X className="h-4 w-4"/></Button></div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedDrive.imageUrl && <img src={selectedDrive.imageUrl} alt={selectedDrive.title} className="w-full h-64 object-cover rounded-md"/>}
              <div><h3 className="font-medium mb-2">Description</h3><p className="text-sm text-muted-foreground">{selectedDrive.description}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><h3 className="font-medium mb-2">Date & Time</h3><div className="space-y-1"><div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{formatDate(selectedDrive.date)}</span></div><div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" /><span>{formatTime(selectedDrive.date)}</span></div></div></div><div><h3 className="font-medium mb-2">Location</h3><div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{selectedDrive.location}</span></div></div></div>
              <div><h3 className="font-medium mb-2">Organizer</h3><div className="flex items-center gap-3"><Avatar><AvatarImage src={selectedDrive.organizer.avatar || "/placeholder.svg"} alt={selectedDrive.organizer.name} /><AvatarFallback>{selectedDrive.organizer.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar><div><p className="font-medium">{selectedDrive.organizer.name}</p>{selectedDrive.contactInfo && (<p className="text-sm text-muted-foreground">{selectedDrive.contactInfo}</p>)}</div></div></div>
              {selectedDrive.requirements && selectedDrive.requirements.length > 0 && (<div><h3 className="font-medium mb-2">Requirements</h3><ul className="list-disc list-inside space-y-1">{selectedDrive.requirements.map((req, index) => (<li key={index} className="text-sm text-muted-foreground">{req}</li>))}</ul></div>)}
              {selectedDrive.tags && selectedDrive.tags.length > 0 && (<div><h3 className="font-medium mb-2">Tags</h3><div className="flex flex-wrap gap-2">{selectedDrive.tags.map((tag, index) => (<Badge key={index} variant="outline">{tag}</Badge>))}</div></div>)}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" /><span className="font-medium">{selectedDrive.participantCount}/{selectedDrive.maxParticipants || '∞'} participants</span></div><div className="flex items-center gap-2"><Heart className="h-5 w-5 text-muted-foreground" /><span className="font-medium">+{selectedDrive.pointsReward || 0} civic points</span></div></div>
              {selectedDrive.status === "upcoming" && (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleJoinDrive(selectedDrive.id)} disabled={selectedDrive.participants.includes(user?.uid || '') || (selectedDrive.maxParticipants ? selectedDrive.participantCount >= selectedDrive.maxParticipants : false)}>
                    {selectedDrive.participants.includes(user?.uid || '') ? "Already Joined" : (selectedDrive.maxParticipants && selectedDrive.participantCount >= selectedDrive.maxParticipants) ? "Drive Full" : "Join This Drive"}
                  </Button>
                  <Button variant="outline"><Share2 className="h-4 w-4 mr-2" />Share</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showDeleteDialog && driveToDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Drive</AlertDialogTitle>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteDrive} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <CreateDriveModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}