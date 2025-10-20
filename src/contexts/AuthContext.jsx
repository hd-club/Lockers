import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../config/firebase'
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence 
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const login = async (email, password, rememberMe = false) => {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    if (rememberMe) {
      localStorage.setItem("hedo_last_email", email)
      localStorage.setItem("hedo_remember", "1")
    } else {
      localStorage.removeItem("hedo_last_email")
      localStorage.removeItem("hedo_remember")
    }
    
    return userCredential
  }

  const logout = () => {
    return signOut(auth)
  }

  const checkAdminStatus = async (user) => {
    if (user) {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid))
      setIsAdmin(adminDoc.exists())
    } else {
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await checkAdminStatus(user)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    isAdmin,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}