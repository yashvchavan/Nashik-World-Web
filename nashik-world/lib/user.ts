import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp,
  FieldValue,
  enableNetwork,
  disableNetwork
} from "firebase/firestore"
import { db } from "./firebase"
import { uploadToCloudinary } from "./cloudinary"
import type { UserProfile, UserProfileUpdate } from "@/types/user"

async function checkOnlineStatus() {
  if (!window.navigator.onLine) {
    throw new Error("You are offline. Please check your internet connection.")
  }
}

export async function createUserProfile(userId: string, data: Partial<UserProfile>) {
  await checkOnlineStatus()
  const userRef = doc(db, "users", userId)
  const now = serverTimestamp()
  
  const profileData = {
    id: userId,
    name: data.name || "",
    email: data.email || "",
    avatar: data.avatar || "",
    points: 0,
    issuesReported: 0,
    issuesResolved: 0,
    verifications: 0,
    createdAt: now,
    updatedAt: now,
    ...data
  }

  await setDoc(userRef, profileData)
  return {
    ...profileData,
    createdAt: new Date(),
    updatedAt: new Date()
  } as UserProfile
}

export async function getUserProfile(userId: string) {
  await checkOnlineStatus()
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  
  if (userSnap.exists()) {
    const data = userSnap.data()
    // Convert Firestore Timestamps to Dates
    return {
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate()
    } as UserProfile
  }
  return null
}

export async function updateUserProfile(userId: string, data: UserProfileUpdate) {
  await checkOnlineStatus()
  const userRef = doc(db, "users", userId)
  
  // Only include fields that are actually being updated
  const updateData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, any>)

  // Always include updatedAt
  updateData.updatedAt = serverTimestamp()

  try {
    await updateDoc(userRef, updateData)
    
    // Return the data with dates converted to Date objects
    return {
      ...updateData,
      updatedAt: new Date()
    }
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.code === 'unavailable') {
      throw new Error("Unable to save changes while offline. Please check your connection.")
    }
    throw error
  }
}

export async function uploadProfileImage(userId: string, file: File) {
  await checkOnlineStatus()
  
  try {
    const imageUrl = await uploadToCloudinary(file, {
      folder: 'profile-images',
      publicId: userId // Use userId as the image name for easy updates
    })
    
    await updateUserProfile(userId, { avatar: imageUrl })
    return imageUrl
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Failed to upload profile image. Please try again.')
  }
}
