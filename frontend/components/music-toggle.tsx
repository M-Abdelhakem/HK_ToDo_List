"use client"

import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { useMusic } from "@/contexts/music-context"

export function MusicToggle() {
  const { isMuted, toggleMute } = useMusic()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleMute}
      className="fixed bottom-6 right-6 h-12 w-12 rounded-full border-2 border-primary/50 bg-card hover:bg-primary/20 hover:border-primary transition-all duration-300 hover:scale-110 shadow-lg shadow-primary/20 z-50"
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? <VolumeX className="h-5 w-5 text-primary" /> : <Volume2 className="h-5 w-5 text-primary" />}
    </Button>
  )
}
