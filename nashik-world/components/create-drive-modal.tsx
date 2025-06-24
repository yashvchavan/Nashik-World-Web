"use client"

import { useState } from "react"
import { useTranslation } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createDrive } from "@/lib/drives"
import { DriveCategory } from "@/types/drive"

interface CreateDriveModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateDriveModal({ isOpen, onClose }: CreateDriveModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    maxParticipants: "",
    pointsReward: "",
    requirements: "",
    contactInfo: "",
    tags: [] as string[],
  })
  const [currentTag, setCurrentTag] = useState("")

  const categories = [
    { value: "cleanup", label: "Cleanup Drive" },
    { value: "plantation", label: "Tree Plantation" },
    { value: "awareness", label: "Awareness Campaign" },
    { value: "maintenance", label: "Infrastructure Maintenance" },
    { value: "other", label: "Other" },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "",
      maxParticipants: "",
      pointsReward: "",
      requirements: "",
      contactInfo: "",
      tags: [],
    })
    setCurrentTag("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to create a drive.",
        variant: "destructive",
      })
      return
    }

    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await createDrive({
        title: formData.title,
        description: formData.description,
        category: formData.category as DriveCategory,
        date: new Date(`${formData.date}T${formData.time}`),
        location: formData.location,
        coordinates: { lat: 0, lng: 0 }, // Placeholder
        organizer: {
          userId: user.uid,
          name: user.displayName || "Anonymous",
          ...(user.photoURL ? { avatar: user.photoURL } : {})
        },
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : undefined,
        pointsReward: formData.pointsReward ? parseInt(formData.pointsReward, 10) : undefined,
        requirements: formData.requirements ? formData.requirements.split('\n') : undefined,
        contactInfo: formData.contactInfo || undefined,
        tags: formData.tags,
      })

      toast({
        title: "Drive Created Successfully!",
        description: "Your community drive has been created and will be reviewed before publishing.",
      })
      
      resetForm()
      onClose()
    } catch (error) {
      console.error("Failed to create drive:", error)
      toast({
        title: "Failed to create drive",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Community Drive</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Drive Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Nashik River Cleanup Drive"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and activities of your drive..."
                className="min-h-[100px]"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-10"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    className="pl-10"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Godavari Riverbank, Ramkund"
                  className="pl-10"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category and Max Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="50"
                    className="pl-10"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Points Reward */}
            <div className="space-y-2">
              <Label htmlFor="pointsReward">Civic Points Reward</Label>
              <Input
                id="pointsReward"
                type="number"
                placeholder="30"
                value={formData.pointsReward}
                onChange={(e) => handleInputChange("pointsReward", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Points participants will earn for joining this drive</p>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                placeholder="e.g., Bring gloves, wear comfortable clothes, carry water bottle (separate each requirement with a new line)"
                value={formData.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Input
                id="contactInfo"
                placeholder="e.g., Contact: +91 98765 43210"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange("contactInfo", e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Drive"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
