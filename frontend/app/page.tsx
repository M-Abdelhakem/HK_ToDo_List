"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function RootPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-background/80 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-accent rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-primary/50 rotate-45"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 border border-accent/50 rotate-12"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-12 px-4">
        {/* Title with decorative elements */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary"></div>
            <div className="w-3 h-3 rotate-45 border-2 border-primary"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary"></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-wider text-foreground">
            HOLLOWNEST
            <br />
            <span className="text-primary">QUEST JOURNAL</span>
          </h1>

          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent"></div>
            <div className="w-3 h-3 rotate-45 border-2 border-accent"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent"></div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground text-lg md:text-xl tracking-wide">
          Chronicle your journey through the depths
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
          <Button
            onClick={() => router.push("/login")}
            size="lg"
            className="w-64 h-14 text-lg font-semibold tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary/50 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
          >
            OLD WANDERER
          </Button>

          <Button
            onClick={() => router.push("/register")}
            size="lg"
            variant="outline"
            className="w-64 h-14 text-lg font-semibold tracking-wide border-2 border-accent hover:bg-accent/10 hover:border-accent shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            NEW WANDERER
          </Button>
        </div>

        {/* Bottom decoration */}
        <div className="pt-12 opacity-50">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-300"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
