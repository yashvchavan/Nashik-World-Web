import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment as firestoreIncrement,
  FieldValue,
  limit,
  arrayUnion
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase"
import type { Issue, IssueStatus, IssueFirestore, IssueUpdate } from "@/types/issue"
import { updateUserProfile } from "./user"
import type { UserProfileUpdate } from "@/types/user"

export async function createIssue(userId: string, issueData: Omit<Issue, "id" | "userId" | "reportedOn" | "verified" | "upvotes" | "updates">) {
  const issuesRef = collection(db, "issues")
  const now = new Date()
  
  const issue = {
    ...issueData,
    userId,
    reportedOn: serverTimestamp(),
    verified: false,
    upvotes: 0,
    updates: [{
      date: now,  // Use regular Date for array
      status: issueData.status,
      comment: "Issue reported"
    }]
  }

  const docRef = await addDoc(issuesRef, issue)

  // Update user's issue count
  await updateUserProfile(userId, {
    issuesReported: firestoreIncrement(1)
  } as UserProfileUpdate)

  return {
    ...issue,
    id: docRef.id,
    reportedOn: now,
    updates: [{
      date: now,
      status: issueData.status,
      comment: "Issue reported"
    }]
  } as Issue
}

export async function getUserIssues(userId: string) {
  const issuesRef = collection(db, "issues")
  const q = query(
    issuesRef,
    where("userId", "==", userId),
    orderBy("reportedOn", "desc")
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      reportedOn: (data.reportedOn as Timestamp).toDate(),
      resolvedOn: data.resolvedOn ? (data.resolvedOn as Timestamp).toDate() : undefined,
      updates: data.updates.map((update: any) => ({
        ...update,
        date: (update.date as Timestamp).toDate()
      }))
    } as Issue
  })
}

export async function getIssueById(issueId: string) {
  const issueRef = doc(db, "issues", issueId)
  const issueSnap = await getDoc(issueRef)

  if (!issueSnap.exists()) return null

  const data = issueSnap.data()
  return {
    ...data,
    id: issueSnap.id,
    reportedOn: (data.reportedOn as Timestamp).toDate(),
    resolvedOn: data.resolvedOn ? (data.resolvedOn as Timestamp).toDate() : undefined,
    updates: data.updates.map((update: any) => ({
      ...update,
      date: (update.date as Timestamp).toDate()
    }))
  } as Issue
}

export async function updateIssueStatus(
  issueId: string, 
  status: IssueStatus, 
  comment: string,
  images?: string[]
) {
  const issueRef = doc(db, "issues", issueId)
  const now = new Date() // Use regular Date object for array operations
  const serverNow = serverTimestamp() // Use serverTimestamp for top-level fields

  const updateData: any = {
    status,
    ...(status === "resolved" ? { resolvedOn: serverNow } : {}),
    ...(images ? { images } : {})
  }

  try {
    await updateDoc(issueRef, {
      ...updateData,
      [`updates`]: arrayUnion({
        date: now, // Use regular Date for array operation
        status,
        comment
      })
    })
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.code === 'unavailable') {
      throw new Error("Unable to update issue while offline")
    }
    throw error
  }
}

export async function verifyIssueResolution(issueId: string, userId: string) {
  const issueRef = doc(db, "issues", issueId)
  const issue = await getIssueById(issueId)
  
  if (!issue) throw new Error("Issue not found")
  if (issue.verified) throw new Error("Issue already verified")
  if (issue.status !== "resolved") throw new Error("Issue must be resolved before verification")

  const now = new Date()
  
  try {
    await updateDoc(issueRef, {
      verified: true,
      [`updates`]: arrayUnion({
        date: now,
        status: "resolved" as const,
        comment: "Resolution verified by citizen"
      })
    })

    // Update user verification count and points
    await updateUserProfile(userId, {
      verifications: firestoreIncrement(1),
      points: firestoreIncrement(10)
    } as UserProfileUpdate)

    return {
      ...issue,
      verified: true,
      updates: [...issue.updates, {
        date: now,
        status: "resolved" as const,
        comment: "Resolution verified by citizen"
      }]
    } as Issue
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.code === 'unavailable') {
      throw new Error("Unable to verify resolution while offline")
    }
    throw error
  }
}

export async function uploadIssueImage(issueId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `issue-images/${issueId}/${file.name}`)
  
  try {
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error: any) {
    if (error.code === 'storage/unauthorized') {
      throw new Error("Unable to upload image. Please check your permissions.")
    }
    throw error
  }
}

export async function getAllIssues(limitCount: number = 10) {
  const issuesRef = collection(db, "issues")
  const q = query(
    issuesRef,
    orderBy("reportedOn", "desc"),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      reportedOn: (data.reportedOn as Timestamp).toDate(),
      resolvedOn: data.resolvedOn ? (data.resolvedOn as Timestamp).toDate() : undefined,
      updates: data.updates.map((update: any) => ({
        ...update,
        date: (update.date as Timestamp).toDate()
      }))
    } as Issue
  })
}
