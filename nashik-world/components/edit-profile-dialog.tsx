"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Camera, AlertTriangle } from "lucide-react"
import { uploadProfileImage, updateUserProfile } from "@/lib/user"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface EditProfileDialogProps {
  name: string
  email: string
  avatar: string
  onUpdate: () => Promise<void>
}

export function EditProfileDialog({ name: initialName, email, avatar: initialAvatar, onUpdate }: EditProfileDialogProps) {
  const [name, setName] = useState(initialName)
  const [avatar, setAvatar] = useState(initialAvatar)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Handle online/offline status
  useEffect(() => {
    function handleOnline() {
      setIsOffline(false)
      setError(null)
    }

    function handleOffline() {
      setIsOffline(true)
      setError("You are currently offline. Changes cannot be saved.")
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(initialName)
      setAvatar(initialAvatar)
      setError(null)
    }
  }, [open, initialName, initialAvatar])

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!user?.uid || !e.target.files?.[0] || isOffline) return

      try {
        setIsUploading(true)
        setError(null)
        const file = e.target.files[0]
        const downloadURL = await uploadProfileImage(user.uid, file)
        setAvatar(downloadURL)
        toast({
          title: "Success",
          description: "Profile photo updated successfully!"
        })
      } catch (error) {
        console.error("Error uploading image:", error)
        setError(error instanceof Error ? error.message : "Failed to upload image. Please try again.")
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to upload image. Please try again."
        })
      } finally {
        setIsUploading(false)
      }
    },
    [user?.uid, toast, isOffline]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!user?.uid || isSaving || isOffline) return

      try {
        setIsSaving(true)
        setError(null)
        await updateUserProfile(user.uid, { 
          name,
          avatar
        })
        await onUpdate()
        toast({
          title: "Success",
          description: "Profile updated successfully!"
        })
        setOpen(false)
      } catch (error) {
        console.error("Error updating profile:", error)
        setError(error instanceof Error ? error.message : "Failed to update profile. Please try again.")
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update profile. Please try again."
        })
      } finally {
        setIsSaving(false)
      }
    },
    [user?.uid, name, avatar, onUpdate, isSaving, toast, isOffline]
  )

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isSaving) return // Prevent closing while saving
      setOpen(newOpen)
    }}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <Camera className="h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 text-sm p-3 text-destructive bg-destructive/10 rounded-md">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatar} />
                <AvatarFallback>
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ${
                  isOffline ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading || isSaving || isOffline}
                />
              </label>
            </div>
            
            <div className="w-full space-y-2">
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUploading || isSaving || isOffline}
              />
              <Input
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isUploading || isSaving || !name.trim() || isOffline}
            >
              {isUploading ? "Uploading..." : isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
