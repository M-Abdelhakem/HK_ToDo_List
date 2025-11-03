"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"

interface MusicContextType {
  isMuted: boolean
  toggleMute: () => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

const MUSIC_MUTE_KEY = "music_muted"

// Global audio instance - shared across all component instances
let globalAudio: HTMLAudioElement | null = null

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    // Default to unmuted (music playing)
    // Check localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MUSIC_MUTE_KEY)
      // If no stored value, default to false (unmuted/music playing)
      // Only return true if explicitly set to "true" in localStorage
      return stored === "true"
    }
    // Default to false (unmuted/music playing) when window is not available
    return false
  })
  const audioInitializedRef = useRef(false)

  // Initialize audio only once on mount
  useEffect(() => {
    if (!audioInitializedRef.current && typeof window !== "undefined") {
      audioInitializedRef.current = true
      
      // Create global audio instance if it doesn't exist
      if (!globalAudio) {
        globalAudio = new Audio("/music/background.mp3")
        globalAudio.loop = true
        globalAudio.volume = 0.2

        // Always try to play on mount - default is unmuted (music playing)
        if (!isMuted) {
          globalAudio.play().catch(() => {
            // Handle autoplay restrictions - some browsers block autoplay
            console.log("Audio autoplay prevented by browser - user interaction required")
            // Reflect actual state in UI by showing muted icon until user interacts
            setIsMuted(true)
          })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync audio state with isMuted state
  useEffect(() => {
    if (globalAudio && audioInitializedRef.current) {
      if (isMuted) {
        globalAudio.pause()
      } else {
        globalAudio.play().catch(() => {
          console.log("Audio playback prevented by browser")
          // If playback fails on unmute, revert to muted so the icon matches reality
          setIsMuted(true)
        })
      }
    }
  }, [isMuted])

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    // Persist mute state to localStorage only when user explicitly toggles
    if (typeof window !== "undefined") {
      localStorage.setItem(MUSIC_MUTE_KEY, String(newMutedState))
    }
  }

  return (
    <MusicContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider")
  }
  return context
}

