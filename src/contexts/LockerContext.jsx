import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  writeBatch 
} from 'firebase/firestore'
import { useAuth } from './AuthContext'
import { useFirebase } from './FirebaseContext'

const LockerContext = createContext()

export const useLocker = () => {
  const context = useContext(LockerContext)
  if (!context) {
    throw new Error('useLocker doit être utilisé dans LockerProvider')
  }
  return context
}

const LS_KEY = "hedo_lockers_cache_v10"

export const LockerProvider = ({ children }) => {
  const [lockers, setLockers] = useState([])
  const { currentUser, isAdmin } = useAuth()
  const { db } = useFirebase()

  const padId = (n) => {
    const num = Number(n)
    if (Number.isNaN(num) || num < 0) return String(n || "")
    return String(num).padStart(3, "0")
  }

  const saveLocal = (data) => {
    localStorage.setItem(LS_KEY, JSON.stringify({ map: data }))
  }

  const loadLocal = () => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed.map)) {
          return parsed.map
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du cache local:", error)
    }
    return []
  }

  const upsertLocker = async (locker, uid) => {
    const id = padId(locker)
    const ref = doc(db, "lockers", id)
    const snap = await getDoc(ref)

    const payload = {
      locker: Number(locker),
      uid: uid || null,
      updatedAt: serverTimestamp()
    }

    if (!snap.exists()) {
      payload.createdBy = currentUser ? currentUser.uid : null
    }

    await setDoc(ref, payload, { merge: true })
  }

  const deleteLocker = async (locker) => {
    const id = padId(locker)
    await deleteDoc(doc(db, "lockers", id))
  }

  const findLockerByUID = async (uid) => {
    const qs = await getDocs(query(collection(db, "lockers"), where("uid", "==", uid)))
    if (qs.empty) return null
    const first = qs.docs[0]
    return first.data().locker ?? Number(first.id)
  }

  const createBulkLockers = async () => {
    if (!isAdmin) {
      throw new Error("Création en base réservée aux admins.")
    }

    const batch = writeBatch(db)
    for (let n = 1; n <= 130; n++) {
      const id = padId(n)
      batch.set(
        doc(db, "lockers", id),
        {
          locker: n,
          uid: null,
          updatedAt: serverTimestamp(),
          createdBy: currentUser?.uid || null
        },
        { merge: true }
      )
    }
    await batch.commit()
  }

  const canEditLocker = (locker) => {
    if (isAdmin) return true
    const ownerUid = locker.createdBy || null
    return !!ownerUid && ownerUid === currentUser?.uid
  }

  const canDeleteLocker = (locker) => {
    return canEditLocker(locker)
  }

  useEffect(() => {
    if (!db) return

    const q = query(collection(db, "lockers"), orderBy("locker"))
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({
        locker: Number((d.data()?.locker) ?? d.id),
        ...(d.data() || {})
      }))
      setLockers(data)
      saveLocal(data)
    })

    // Charger le cache local au démarrage
    const localData = loadLocal()
    if (localData.length > 0) {
      setLockers(localData)
    }

    return () => unsubscribe()
  }, [db])

  const value = {
    lockers,
    upsertLocker,
    deleteLocker,
    findLockerByUID,
    createBulkLockers,
    canEditLocker,
    canDeleteLocker,
    saveLocal,
    loadLocal
  }

  return (
    <LockerContext.Provider value={value}>
      {children}
    </LockerContext.Provider>
  )
}