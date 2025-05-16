"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, Camera, MapPin, Mic, X, ChevronRight, ChevronLeft, Upload, Check, LinkIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { createIssue, updateIssueStatus } from "@/lib/issues"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { IssueType, IssueStatus } from "@/types/issue"

type ReportIssueModalProps = {
  isOpen: boolean
  onClose: () => void
}

type IssueCategory = {
  id: string
  name: string
  icon: React.ReactNode
}

export function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState("")
  const [isUsingGPS, setIsUsingGPS] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories: IssueCategory[] = [
    {
      id: "pothole",
      name: t("pothole"),
      icon: (
        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
      ),
    },
    {
      id: "waterLeak",
      name: t("waterLeak"),
      icon: (
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-blue-600" />
        </div>
      ),
    },
    {
      id: "garbage",
      name: t("garbage"),
      icon: (
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-green-600" />
        </div>
      ),
    },
    {
      id: "streetlight",
      name: t("streetlight"),
      icon: (
        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
        </div>
      ),
    },
    {
      id: "fallenTree",
      name: t("fallenTree"),
      icon: (
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
      ),
    },
    {
      id: "other",
      name: "Other",
      icon: (
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-gray-600" />
        </div>
      ),
    },
  ]

  const handleNext = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please sign in to report an issue"
      })
      return
    }

    // Return early if we're not on the final step
    if (step < 4) {
      setStep(step + 1)
      return
    }

    // Prevent double submission
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      let imageUrl: string | undefined

      // Upload image first if provided
      if (imageFile) {
        try {
          imageUrl = await uploadToCloudinary(imageFile)
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError)
          toast({
            title: "Warning",
            description: "Image upload failed, please try again.",
            variant: "destructive"
          })
          setIsSubmitting(false)
          return
        }
      }

      // Create the issue with all data at once
      const issue = await createIssue(user.uid, {
        type: selectedCategory as IssueType,
        description,
        location: address,
        coordinates: location!,
        status: "open",
        images: imageUrl ? [imageUrl] : [],
        address,
        ward: "auto",
        reportedBy: {
          name: user.displayName || "Anonymous",
          ...(user.photoURL ? { avatar: user.photoURL } : {})
        }
      })

      setTransactionId(issue.id)
      toast({
        title: "Success",
        description: "Issue reported successfully!"
      })

      // Close after a delay to show the success state
      setTimeout(() => {
        onClose()
        // Reset all state
        setStep(1)
        setSelectedCategory(null)
        setDescription("")
        setLocation(null)
        setAddress("")
        setUploadedImage(null)
        setImageFile(null)
        setTransactionId(null)
      }, 3000)

    } catch (error) {
      console.error("Error reporting issue:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to report issue. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleGetLocation = () => {
    setIsUsingGPS(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(coords)
          
          // Get address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            )
            const data = await response.json()
            if (data.results?.[0]) {
              setAddress(data.results[0].formatted_address)
            }
          } catch (error) {
            console.error("Error getting address:", error)
          }
          
          setIsUsingGPS(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get your location. Please try again or enter it manually."
          })
          setIsUsingGPS(false)
        },
      )
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Geolocation is not supported by your browser."
      })
      setIsUsingGPS(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Preview the image
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Store the file for later upload
      setImageFile(file)
    }
  }

  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !selectedCategory
      case 2:
        return !location
      case 3:
        return !description
      default:
        return false
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 4 && transactionId ? "Issue Reported Successfully!" : t("reportIssue")}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        {!transactionId && (
          <div className="flex justify-between mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium",
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : step > s
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Step content */}
        {transactionId ? (
          <div className="flex flex-col items-center py-6">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-center mb-4">
              Your issue has been reported successfully and will be reviewed by the authorities.
            </p>
            <div className="bg-muted p-3 rounded-md w-full mb-4">
              <p className="text-sm font-medium mb-1">Transaction ID (Blockchain):</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background p-2 rounded w-full overflow-x-auto">{transactionId}</code>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">+10 Civic Points Earned</Badge>
          </div>
        ) : step === 1 ? (
          <div>
            <h3 className="font-medium mb-4">{t("selectCategory") || "Select Category"}</h3>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    "border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-colors",
                    selectedCategory === category.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.icon}
                  <span className="mt-2 text-sm font-medium">{category.name}</span>
                </div>
              ))}
            </div>

            {uploadedImage ? (
              <div className="mt-6">
                <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded issue"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setUploadedImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  AI has detected this as a <strong>{t("pothole")}</strong> issue.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Upload a photo for AI to auto-detect the issue type
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="w-full" asChild>
                    <label>
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <label>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : step === 2 ? (
          <div>
            <h3 className="font-medium mb-4">{t("location")}</h3>

            <div className="mb-4">
              <Button variant="outline" className="w-full mb-4" onClick={handleGetLocation} disabled={isUsingGPS}>
                <MapPin className="h-4 w-4 mr-2" />
                {isUsingGPS ? "Getting location..." : "Use my current location"}
              </Button>

              {location && (
                <div className="text-sm bg-muted p-2 rounded">
                  <p>Latitude: {location.lat.toFixed(6)}</p>
                  <p>Longitude: {location.lng.toFixed(6)}</p>
                </div>
              )}
            </div>

            <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
              {location ? (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-[url('/placeholder.svg?height=300&width=500')] bg-cover bg-center"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Map will appear here</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-2">Drag the pin to adjust the exact location if needed</p>
          </div>
        ) : step === 3 ? (
          <div>
            <h3 className="font-medium mb-4">{t("description")}</h3>

            <Tabs defaultValue="text">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="text" className="flex-1">
                  Text
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex-1">
                  Voice
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <Textarea
                  placeholder={t("describeIssue") || "Describe the issue in detail..."}
                  className="min-h-[150px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </TabsContent>

              <TabsContent
                value="voice"
                className="h-[150px] flex flex-col items-center justify-center border rounded-md"
              >
                <Button variant="outline" size="lg" className="gap-2">
                  <Mic className="h-5 w-5" />
                  Start Recording
                </Button>
                <p className="text-xs text-muted-foreground mt-4">Click to start recording your voice description</p>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div>
            <h3 className="font-medium mb-4">{t("preview") || "Preview"}</h3>

            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">{t("category") || "Category"}</h4>
                <div className="flex items-center gap-2">
                  {categories.find((c) => c.id === selectedCategory)?.icon}
                  <span>{categories.find((c) => c.id === selectedCategory)?.name}</span>
                </div>
              </div>

              {uploadedImage && (
                <div className="border rounded-md p-4">
                  <h4 className="text-sm font-medium mb-2">{t("uploadPhoto") || "Photo"}</h4>
                  <div className="w-full h-40 bg-muted rounded-md overflow-hidden">
                    <img src={uploadedImage || "/placeholder.svg"} alt="Issue" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">{t("location")}</h4>
                <div className="w-full h-32 bg-muted rounded-md overflow-hidden">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=400')] bg-cover bg-center"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
                <p className="text-xs mt-2">
                  {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                </p>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">{t("description")}</h4>
                <p className="text-sm">{description || "No description provided."}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          {!transactionId && (
            <>
              {step > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t("back") || "Back"}
                </Button>
              )}
              <Button onClick={handleNext} disabled={isNextDisabled()} className={step === 1 ? "ml-auto" : ""}>
                {step === 4 ? t("submit") : t("next") || step === 4 ? "Submit" : "Next"}
                {step < 4 && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
