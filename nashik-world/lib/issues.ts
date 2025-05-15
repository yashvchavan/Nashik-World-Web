import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment as firestoreIncrement,
  FieldValue,
  limit,
  arrayUnion,
  arrayRemove,
  onSnapshot
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase"
import { deleteFromCloudinary } from "./cloudinary"
import { checkOnlineStatus } from "./utils"
import type { Issue, IssueStatus, IssueFirestore, IssueUpdate, IssueComment } from "@/types/issue"
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

export async function updateIssue(issueId: string, updates: Partial<Issue>) {
  await checkOnlineStatus()
  
  try {
    const issueRef = doc(db, 'issues', issueId)
    await updateDoc(issueRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error: any) {
    console.error('Error updating issue:', error)
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to update this issue.')
    }
    throw new Error('Failed to update issue. Please try again.')
  }
}

export async function deleteIssuePhoto(issueId: string, imageUrl: string, userId?: string) {
  await checkOnlineStatus()

  try {
    const issueRef = doc(db, 'issues', issueId)
    
    // Delete from Cloudinary first
    await deleteFromCloudinary(imageUrl)
    
    // Update the issue document
    await updateDoc(issueRef, {
      images: arrayRemove(imageUrl),
      updates: arrayUnion({
        date: new Date(),
        status: 'open',
        comment: 'Photo deleted',
        author: userId,
      }),
      updatedAt: serverTimestamp()
    })
  } catch (error: any) {
    console.error('Error deleting issue photo:', error)
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to delete photos from this issue.')
    }
    throw new Error('Failed to delete photo. Please try again.')
  }
}

export async function deleteIssue(issueId: string) {
  await checkOnlineStatus()

  try {
    const issueRef = doc(db, 'issues', issueId)
    
    // Get the issue first to delete associated images
    const issue = await getIssueById(issueId)
    if (issue?.images?.length) {
      // Delete all images from Cloudinary
      await Promise.all(issue.images.map(imageUrl => deleteFromCloudinary(imageUrl)))
    }
    
    // Delete the issue document
    await deleteDoc(issueRef)
  } catch (error: any) {
    console.error('Error deleting issue:', error)
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to delete this issue.')
    }
    throw new Error('Failed to delete issue. Please try again.')
  }
}

// Real-time listeners for issues
export function subscribeToIssues(callback: (issues: Issue[]) => void) {
  const issuesRef = collection(db, "issues")
  const q = query(issuesRef, orderBy("reportedOn", "desc"))
  
  return onSnapshot(q, (snapshot) => {
    const issues = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        reportedOn: data.reportedOn.toDate(),
        resolvedOn: data.resolvedOn ? data.resolvedOn.toDate() : undefined,
        updates: data.updates.map((update: any) => ({
          ...update,
          date: update.date.toDate()
        }))
      } as Issue
    })
    callback(issues)
  })
}

export function subscribeToComments(issueId: string, callback: (comments: IssueComment[]) => void) {
  const commentsRef = collection(db, "issues", issueId, "comments")
  const q = query(commentsRef, orderBy("date", "desc"))
  
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate()
      } as IssueComment
    })
    callback(comments)
  })
}

export async function addComment(issueId: string, comment: Omit<IssueComment, "id" | "date">) {
  const commentsRef = collection(db, "issues", issueId, "comments")
  
  try {
    await addDoc(commentsRef, {
      ...comment,
      date: serverTimestamp()
    })
  } catch (error: any) {
    console.error('Error adding comment:', error)
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to comment on this issue.')
    }
    throw new Error('Failed to add comment. Please try again.')
  }
}
