import React, { createContext, useContext } from 'react'
import { db } from '../config/firebase'

const FirebaseContext = createContext()

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error('useFirebase doit être utilisé dans FirebaseProvider')
  }
  return context
}

export const FirebaseProvider = ({ children }) => {
  const value = {
    db
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  )
}