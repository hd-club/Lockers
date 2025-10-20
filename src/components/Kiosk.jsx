import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocker } from '../contexts/LockerContext'
import { useQRScanner } from '../hooks/useQRScanner'
import './Kiosk.css'

const Kiosk = () => {
  const { currentUser } = useAuth()
  const { lockers, findLockerByUID } = useLocker()
  const [displayText, setDisplayText] = useState('Scannez votre bracelet…')
  const [error, setError] = useState('')
  const hiddenInputRef = useRef(null)
  const [scanBuffer, setScanBuffer] = useState('')

  const { isScanning, startScanning, stopScanning, cameraError } = useQRScanner(
    (scannedData) => {
      handleScan(scannedData)
    }
  )

  const normalize = (str) => (str || "").trim()

  const findLocker = (uid) => {
    return lockers.find(r => (r.uid || "") === uid)
  }

  const handleScan = async (rawData) => {
    const token = normalize(rawData)
    if (!token || token.length < 3) return

    setError('')

    // Chercher d'abord dans le cache local
    const localMatch = findLocker(token)
    if (localMatch) {
      showLocker(localMatch.locker)
      if (navigator.vibrate) navigator.vibrate(60)
      return
    }

    // Sinon chercher dans Firestore
    try {
      const locker = await findLockerByUID(token)
      if (locker) {
        showLocker(locker)
      } else {
        showLocker(null)
      }
      if (navigator.vibrate) navigator.vibrate(60)
    } catch (error) {
      console.error("Erreur lors de la recherche:", error)
      showLocker(null)
    }
  }

  const showLocker = (locker) => {
    if (locker) {
      setDisplayText(
        <>
          <div className="note">Votre casier est le</div>
          <div className="big">#{String(locker).padStart(3, "0")}</div>
        </>
      )
    } else {
      setDisplayText(<span className="note">Aucun casier trouvé.</span>)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const data = scanBuffer
      setScanBuffer("")
      handleScan(data)
    } else if (e.key.length === 1) {
      setScanBuffer(prev => prev + e.key)
    } else if (e.key === "Backspace") {
      setScanBuffer(prev => prev.slice(0, -1))
    }
  }

  const focusCapture = () => {
    hiddenInputRef.current?.focus()
  }

  useEffect(() => {
    focusCapture()
    const handleClick = (e) => {
      // Garder le focus sur l'input caché pour la capture clavier
      setTimeout(focusCapture, 0)
    }
    
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  useEffect(() => {
    if (cameraError) {
      setError(`Caméra indisponible: ${cameraError}`)
    }
  }, [cameraError])

  return (
    <section id="view-kiosk">
      <div className="card">
        <h3>Écran client</h3>
        <p className="note">
          Scanne un <b>QR</b> avec la caméra (bouton 📷) ou utilise la <b>douchette USB</b> (mode clavier).
        </p>
        
        <input 
          ref={hiddenInputRef}
          id="hidden-capture" 
          className="hidden" 
          onKeyDown={handleKeyDown}
        />
        
        <div id="kiosk-box" className="kioskbox">
          <div id="kiosk-content" className="note">{displayText}</div>
        </div>
        
        {error && (
          <div id="kiosk-error" className="note" style={{color: 'var(--err)', marginTop: '8px'}}>
            {error}
          </div>
        )}
      </div>
    </section>
  )
}

export default Kiosk