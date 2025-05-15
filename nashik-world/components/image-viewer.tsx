"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ImageViewerProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageViewer({ images, initialIndex = 0, open, onOpenChange }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  
  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const showPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-3xl w-full h-[80vh] flex items-center justify-center">
        <DialogTitle className="sr-only">Image Viewer</DialogTitle>
        <div className="relative w-full h-full">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2"
                onClick={showPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={showNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 bg-background/80 hover:bg-background"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
