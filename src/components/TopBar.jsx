import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const TopBar = () => {
  const { currentUser } = useAuth()

  return (
    <header className="top-bar">
      <div className="top-bar-content">
        <h1>Hedo Lockers</h1>
        {currentUser && (
          <div className="user-info">
            <span>{currentUser.email}</span>
          </div>
        )}
      </div>
    </header>
  )
}

export default TopBar