import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { FirebaseProvider } from './contexts/FirebaseContext'
import { LockerProvider } from './contexts/LockerContext'
import Layout from './components/Layout'
import Kiosk from './components/Kiosk'
import Admin from './components/Admin'
import Login from './components/Login'

function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <LockerProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout><Kiosk /></Layout>} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/admin" element={<Layout><Admin /></Layout>} />
            </Routes>
          </Router>
        </LockerProvider>
      </AuthProvider>
    </FirebaseProvider>
  )
}

export default App