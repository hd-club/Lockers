import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocker } from '../contexts/LockerContext'

const Admin = () => {
  const { currentUser, isAdmin, logout } = useAuth()
  const { 
    lockers, 
    upsertLocker, 
    deleteLocker, 
    createBulkLockers, 
    canEditLocker, 
    canDeleteLocker 
  } = useLocker()

  const [selectedLocker, setSelectedLocker] = useState('')
  const [selectedUID, setSelectedUID] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!currentUser) {
      window.location.href = '/'
    }
  }, [currentUser])

  const handleAssignLocker = async () => {
    if (!selectedLocker) return
    
    try {
      await upsertLocker(selectedLocker, selectedUID)
      setMessage(`Casier ${selectedLocker} assigné avec succès`)
      setSelectedLocker('')
      setSelectedUID('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`Erreur: ${error.message}`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDeleteLocker = async (locker) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le casier ${locker.locker}?`)) return
    
    try {
      await deleteLocker(locker.locker)
      setMessage(`Casier ${locker.locker} supprimé`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`Erreur: ${error.message}`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleCreateBulkLockers = async () => {
    if (!window.confirm('Créer 130 casiers en base? Cela écrasera les existants.')) return
    
    setIsCreating(true)
    try {
      await createBulkLockers()
      setMessage('130 casiers créés avec succès')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`Erreur: ${error.message}`)
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setIsCreating(false)
    }
  }

  const filteredLockers = lockers.filter(locker => {
    const lockerNum = String(locker.locker)
    const term = searchTerm.toLowerCase()
    return lockerNum.includes(term) || (locker.uid && locker.uid.toLowerCase().includes(term))
  })

  if (!currentUser) {
    return <div>Redirection...</div>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h2>Accès non autorisé</h2>
        <p>Vous devez être administrateur pour accéder à cette page.</p>
        <button onClick={() => window.location.href = '/'}>Retour à l'accueil</button>
      </section>
    )
  }

  return (
    <section className="admin-panel">
      <div className="card">
        <h2>Panneau d'administration</h2>
        <p>Connecté en tant que: {currentUser.email}</p>
        <button onClick={logout}>Déconnexion</button>
      </div>

      {message && (
        <div className="card message">
          <p>{message}</p>
        </div>
      )}

      <div className="card">
        <h3>Assigner un casier</h3>
        <div className="form-group">
          <label>Numéro de casier:</label>
          <input
            type="number"
            min="1"
            max="130"
            value={selectedLocker}
            onChange={(e) => setSelectedLocker(e.target.value)}
            placeholder="1-130"
          />
        </div>
        <div className="form-group">
          <label>UID (bracelet):</label>
          <input
            type="text"
            value={selectedUID}
            onChange={(e) => setSelectedUID(e.target.value)}
            placeholder="Scannez le bracelet"
          />
        </div>
        <button onClick={handleAssignLocker} disabled={!selectedLocker}>
          Assigner
        </button>
      </div>

      <div className="card">
        <h3>Création en masse</h3>
        <p>Créer 130 casiers numérotés de 1 à 130</p>
        <button 
          onClick={handleCreateBulkLockers} 
          disabled={isCreating}
        >
          {isCreating ? 'Création... ' : 'Créer les casiers'}
        </button>
      </div>

      <div className="card">
        <h3>Gestion des casiers ({lockers.length})</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Rechercher un casier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="lockers-grid">
          {filteredLockers.map(locker => (
            <div key={locker.locker} className="locker-item">
              <div className="locker-number">
                #{String(locker.locker).padStart(3, '0')}
              </div>
              <div className="locker-uid">
                {locker.uid || 'Libre'}
              </div>
              {canDeleteLocker(locker) && (
                <button
                  onClick={() => handleDeleteLocker(locker)}
                  className="delete-btn"
                  title="Supprimer"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Admin