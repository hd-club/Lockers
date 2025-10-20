/* Firebase v9 */
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAZ7M8dUKqcUwa9rDyWEdHEwnFVPlrpCds",
  authDomain: "lockers-26331.firebaseapp.com",
  projectId: "lockers-26331",
  storageBucket: "lockers-26331.firebasestorage.app",
  messagingSenderId: "601816918378",
  appId: "1:601816918378:web:b6045b10b60e7957c19d13"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app