import { FieldValue } from "firebase/firestore"

export type IssueType = "pothole" | "waterLeak" | "garbage" | "fallenTree" | "streetlight" | "disaster" | "other"
export type IssueStatus = "open" | "inProgress" | "resolved"
export type IssueUrgency = "low" | "medium" | "high"

export interface IssueUpdate {
  date: Date
  status: IssueStatus
  comment: string
  author?: string
}

export interface IssueComment {
  id: string
  date: Date
  content: string
  author: {
    userId: string
    name: string
    avatar?: string
  }
  likes: number
}

export interface Issue {
  id: string
  type: IssueType
  description: string
  location: string
  status: IssueStatus
  coordinates: {
    lat: number
    lng: number
  }
  reportedOn: Date
  userId: string
  reportedBy?: {
    name: string
    avatar?: string
  }
  assignedTo?: string
  estimatedResolution?: Date
  resolvedOn?: Date
  verified: boolean
  upvotes: number
  updates: IssueUpdate[]
  comments?: IssueComment[]
  images?: string[]
  address?: string
  ward?: string
  urgency?: IssueUrgency
}

export interface IssueFirestore extends Omit<Issue, 'reportedOn' | 'resolvedOn' | 'updates'> {
  reportedOn: Date | FieldValue
  resolvedOn?: Date | FieldValue
  updates: (IssueUpdate | { date: FieldValue; status: IssueStatus; comment: string; author?: string })[]
}
