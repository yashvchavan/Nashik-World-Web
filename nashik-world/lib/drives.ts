import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  increment,
  runTransaction,
  deleteDoc,
  getDocs,
  where,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Drive, DriveFirestore, DriveCategory } from "@/types/drive"
import type { UserProfileUpdate } from "@/types/user"
import { updateUserProfile } from "./user"
import { CIVIC_POINTS } from "./constants"

// Create a new community drive
export async function createDrive(driveData: Omit<Drive, 'id' | 'createdAt' | 'participants' | 'participantCount' | 'status'>): Promise<Drive> {
  const drivesRef = collection(db, "drives")
  const now = new Date()

  const newDriveData: Omit<DriveFirestore, 'id'> = {
    ...driveData,
    createdAt: serverTimestamp(),
    participants: [],
    participantCount: 0,
    status: "upcoming",
  }

  const docRef = await addDoc(drivesRef, newDriveData)

  // Award points to the organizer
  if (driveData.organizer && driveData.organizer.userId) {
    await updateUserProfile(driveData.organizer.userId, {
      points: increment(driveData.pointsReward || CIVIC_POINTS.ORGANIZE_DRIVE)
    } as UserProfileUpdate)
  }

  return {
    ...driveData,
    id: docRef.id,
    createdAt: now,
    participants: [],
    participantCount: 0,
    status: "upcoming",
  }
}

// Get real-time updates for all drives
export function subscribeToDrives(callback: (drives: Drive[]) => void) {
  const drivesRef = collection(db, "drives")
  const q = query(drivesRef, orderBy("date", "desc"))

  return onSnapshot(q, (snapshot) => {
    const drives = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate() : null,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : null,
      } as Drive
    })
    callback(drives)
  })
}

// Join a community drive
export async function joinDrive(driveId: string, userId: string): Promise<void> {
  const driveRef = doc(db, "drives", driveId)

  await runTransaction(db, async (transaction) => {
    const driveDoc = await transaction.get(driveRef)
    if (!driveDoc.exists()) {
      throw new Error("Drive does not exist!")
    }

    const drive = driveDoc.data() as Drive
    if (drive.participants.includes(userId)) {
      throw new Error("You have already joined this drive.")
    }

    if (drive.participantCount >= (drive.maxParticipants || Infinity)) {
        throw new Error("This drive is already full.")
    }

    transaction.update(driveRef, {
      participants: [...drive.participants, userId],
      participantCount: increment(1)
    })

    // Award points to the user joining
    await updateUserProfile(userId, {
      points: increment(CIVIC_POINTS.JOIN_DRIVE)
    } as UserProfileUpdate)
  })
}

export async function deleteDrive(driveId: string) {
  const driveRef = doc(db, "drives", driveId)
  await deleteDoc(driveRef)
}

export async function getUpcomingDrives() {
  const drivesRef = collection(db, "drives")
  const now = new Date()
  const q = query(
    drivesRef,
    where("status", "==", "upcoming"),
    where("date", ">=", now),
    orderBy("status"),
    orderBy("date", "asc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate() : null,
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : null,
    } as Drive
  })
} 