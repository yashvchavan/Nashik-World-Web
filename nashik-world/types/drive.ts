import { FieldValue, Timestamp } from "firebase/firestore"

export type DriveCategory = "cleanup" | "plantation" | "awareness" | "maintenance" | "other"

export interface Drive {
  id: string
  title: string
  description: string
  category: DriveCategory
  date: Date
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  organizer: {
    userId: string
    name: string
    avatar?: string
  }
  participants: string[] // Array of user IDs
  participantCount: number
  maxParticipants?: number
  pointsReward?: number
  status: "upcoming" | "ongoing" | "completed"
  tags?: string[]
  requirements?: string[]
  contactInfo?: string
  imageUrl?: string
  createdAt: Date
}

export interface DriveFirestore extends Omit<Drive, 'id' | 'date' | 'createdAt'> {
  date: Timestamp | Date;
  createdAt: Timestamp | FieldValue | Date; 
} 