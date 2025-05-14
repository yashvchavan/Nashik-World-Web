import { FieldValue } from "firebase/firestore"

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  points: number
  issuesReported: number
  issuesResolved: number
  verifications: number
  createdAt: Date
  updatedAt: Date
}

export type UserProfileUpdate = {
  id?: string
  name?: string
  email?: string
  avatar?: string
  points?: number | FieldValue
  issuesReported?: number | FieldValue
  issuesResolved?: number | FieldValue
  verifications?: number | FieldValue
  updatedAt?: Date | FieldValue
}
