"use client"

import type React from "react"

import { AuthProvider } from "@/contexts/auth-context"
import { DataProvider } from "@/contexts/data-context"
import { MusicProvider } from "@/contexts/music-context"
import { MusicToggle } from "@/components/music-toggle"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <MusicProvider>
          {children}
          <MusicToggle />
        </MusicProvider>
      </DataProvider>
    </AuthProvider>
  )
}
