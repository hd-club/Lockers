import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Drawer = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { currentUser, logout } = useAuth()

  const toggleDrawer = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <>
      <div 
        className={`drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={toggleDrawer}
      />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Menu</h3>
          <button onClick={toggleDrawer} className="close-btn">✕</button>
        </div>
        <div className="drawer-content">
          <ul className="drawer-menu">
            <li><a href="/">Accueil</a></li>
            {currentUser && (
              <>
                <li><a href="/admin">Administration</a></li>
                <li><a href="#" onClick={handleLogout}>Déconnexion</a></li>
              </>
            )}
            {!currentUser && (
              <li><a href="/login">Connexion</a></li>
            )}
          </ul>
        </div>
      </div>
      <button onClick={toggleDrawer} className="drawer-toggle">
        ☰
      </button>
    </>
  )
}

export default Drawer