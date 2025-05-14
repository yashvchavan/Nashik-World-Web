import { FieldValue } from "firebase/firestore"

export type IssueStatus = "open" | "inProgress" | "resolved"
export type IssueType = "pothole" | "waterLeak" | "garbage" | "streetLight" | "fallenTree"

export interface IssueUpdate {
  date: Date
  status: IssueStatus
  comment: string
}

export interface Issue {
  id: string
  userId: string
  type: IssueType
  location: string
  description: string
  status: IssueStatus
  reportedOn: Date
  resolvedOn?: Date
  verified: boolean
  images: string[]
  coordinates: {
    lat: number
    lng: number
  }
  address: string
  ward: string
  department?: string
  upvotes: number
  updates: IssueUpdate[]
}

export interface IssueFirestore extends Omit<Issue, 'reportedOn' | 'resolvedOn' | 'updates'> {
  reportedOn: Date | FieldValue
  resolvedOn?: Date | FieldValue
  updates: (IssueUpdate | { date: FieldValue; status: IssueStatus; comment: string })[]
}
