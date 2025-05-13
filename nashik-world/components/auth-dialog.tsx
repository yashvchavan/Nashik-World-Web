"use client"

import { useState } from "react"
import { LogIn } from "lucide-react"
import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTranslation } from "./language-provider"

export function AuthDialog() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { signIn, signUp } = useAuth()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (isRegister) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isRegister ? "Register" : "Login"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isRegister ? "Create a new account to continue" : "Welcome back! Please login to continue"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full h-11 text-base font-semibold">
            {isRegister ? "Register" : "Login"}
          </Button>
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Already have an account? Login" : "New user? Register"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
