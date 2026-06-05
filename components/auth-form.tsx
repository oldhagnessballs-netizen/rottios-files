"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "sign-up") {
        const result = await signUp.email({
          email,
          password,
          name,
        })
        if (result.error) {
          setError(result.error.message || "Sign up failed")
          setLoading(false)
          return
        }
      } else {
        const result = await signIn.email({
          email,
          password,
        })
        if (result.error) {
          setError(result.error.message || "Sign in failed")
          setLoading(false)
          return
        }
      }
      router.push("/")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {mode === "sign-in" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {mode === "sign-in"
              ? "Enter your credentials to sign in"
              : "Fill in the details to create your account"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {mode === "sign-up" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Loading..."
                : mode === "sign-in"
                ? "Sign In"
                : "Sign Up"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {mode === "sign-in" ? (
                <>
                  {"Don't have an account? "}
                  <Link href="/sign-up" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
