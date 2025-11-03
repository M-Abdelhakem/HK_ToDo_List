"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!name || !username || !password) {
      setError("All seals must be inscribed")
      setIsLoading(false)
      return
    }

    // username is actually email in this form
    const result = await register(name, username, password)
    setIsLoading(false)

    if (result.success) {
      // Registration successful, redirect to login
      router.push("/login")
    } else {
      setError(result.error || "Journey cannot begin")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border-2 border-primary/30 rounded-lg p-8 shadow-2xl shadow-primary/10">
          {/* Knight Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-8 text-primary">Begin Your Journey</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm text-muted-foreground">
                Knight Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border focus:border-primary focus:ring-primary transition-all duration-300 font-mono"
                placeholder="Enter your name..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-muted-foreground">
                Email
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-input border-border focus:border-primary focus:ring-primary transition-all duration-300 font-mono"
                placeholder="Enter your email..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-muted-foreground">
                Seal
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border focus:border-primary focus:ring-primary transition-all duration-300 pr-10 font-mono"
                  placeholder="Create your seal..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md border border-destructive/30">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-accent-hover text-primary-foreground font-semibold py-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02]"
            >
              {isLoading ? "Traversing..." : "Begin"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              Already a wanderer? <span className="text-primary font-semibold">Enter Hallownest</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
