import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const BottomNav = () => {
  const { currentUser, isAdmin } = useAuth()

  return (
    <nav className="bottom-nav">
      <div className="nav-content">
        <a href="/" className="nav-item">
          🏠 Accueil
        </a>
        {currentUser && isAdmin ? (
          <a href="/admin" className="nav-item">
            ⚙️ Admin
          </a>
        ) : currentUser ? (
          <a href="/admin" className="nav-item">
            ⚙️ Admin
          </a>
        ) : (
          <a href="/login" className="nav-item">
            🔐 Login
          </a>
        )}
      </div>
    </nav>
  )
}

export default BottomNav