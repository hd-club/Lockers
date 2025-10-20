import { useState, useEffect, useRef } from 'react'

export const useQRScanner = (onScan) => {
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const stopDecoderRef = useRef(null)

  const normalize = (str) => (str || "").trim()

  const handleDecodedText = (text) => {
    const token = normalize(text)
    if (!token) return
    if (onScan) onScan(token)
  }

  const startBarcodeDetectorLoop = (videoEl) => {
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] })
    let stopped = false

    async function tick() {
      if (stopped) return
      try {
        const res = await detector.detect(videoEl)
        if (res && res.length) {
          const txt = res[0].rawValue || ""
          if (txt) {
            handleDecodedText(txt)
            if (navigator.vibrate) navigator.vibrate(60)
          }
        }
      } catch {}
      finally { 
        if (!stopped) requestAnimationFrame(tick) 
      }
    }
    
    requestAnimationFrame(tick)
    return () => { stopped = true }
  }

  const startJsQRLoop = (videoEl) => {
    const cvs = document.createElement("canvas")
    const ctx = cvs.getContext("2d", { willReadFrequently: true })
    let stopped = false

    function frame() {
      if (stopped) return
      const w = videoEl.videoWidth || 640
      const h = videoEl.videoHeight || 480
      if (w && h) {
        cvs.width = w
        cvs.height = h
        ctx.drawImage(videoEl, 0, 0, w, h)
        const imgData = ctx.getImageData(0, 0, w, h)
        const res = window.jsQR(imgData.data, w, h, { inversionAttempts: "attemptBoth" })
        if (res?.data) {
          handleDecodedText(res.data)
          if (navigator.vibrate) navigator.vibrate(60)
        }
      }
      requestAnimationFrame(frame)
    }
    
    requestAnimationFrame(frame)
    return () => { stopped = true }
  }

  const warmUpPermission = async () => {
    const gum = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: { ideal: "environment" }, 
        width: { ideal: 1280 }, 
        height: { ideal: 720 } 
      },
      audio: false
    })
    gum.getTracks().forEach(t => t.stop())
  }

  const startScanning = async () => {
    try {
      setCameraError(null)
      await warmUpPermission()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" }, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        },
        audio: false
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      
      streamRef.current = stream

      if ("BarcodeDetector" in window) {
        const formats = await (window.BarcodeDetector.getSupportedFormats?.() || [])
        if (!formats.length || formats.includes("qr_code")) {
          stopDecoderRef.current = startBarcodeDetectorLoop(videoRef.current)
          setIsScanning(true)
          return
        }
      }
      
      if (window.jsQR) {
        stopDecoderRef.current = startJsQRLoop(videoRef.current)
        setIsScanning(true)
        return
      }
      
      throw new Error("Aucun décodeur dispo (BarcodeDetector/jsQR).")
    } catch (error) {
      setIsScanning(false)
      setCameraError(error.message || "Erreur caméra")
      await stopScanning()
    }
  }

  const stopScanning = async () => {
    try { 
      if (stopDecoderRef.current) { 
        stopDecoderRef.current() 
        stopDecoderRef.current = null 
      } 
    } catch {}
    
    try { 
      if (streamRef.current) { 
        streamRef.current.getTracks().forEach(t => t.stop()) 
        streamRef.current = null 
      } 
    } catch{}
    
    try { 
      if (videoRef.current) { 
        videoRef.current.pause() 
        videoRef.current.srcObject = null 
      } 
    } catch{}
    
    setIsScanning(false)
  }

  // Resume after background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isScanning) {
        stopScanning().then(startScanning).catch(() => {})
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [isScanning])

  return {
    isScanning,
    startScanning,
    stopScanning,
    cameraError,
    videoRef
  }
}