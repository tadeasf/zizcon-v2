"use client"

import Link from "next/link"
import { ModeToggle } from "./mode-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useEffect, useState } from "react"

interface UserProfile {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
}

export function Header() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/auth/profile")
        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const NavItems = () => (
    <>
      <Link href="/" className="font-bold text-foreground hover:text-foreground/80">
        Home
      </Link>
      <Link href="/blog" className="text-foreground hover:text-foreground/80">
        Blog
      </Link>
    </>
  )

  const AuthButtons = () => (
    <>
      {!loading && (
        <>
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/auth/logout">Sign out</a>
              </Button>
            </>
          ) : (
            <Button asChild>
              <a href="/auth/login">Sign in</a>
            </Button>
          )}
        </>
      )}
    </>
  )

  return (
    <header className="w-full border-b">
      <div className="flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          <NavItems />
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <SheetHeader>
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-4" aria-label="Mobile navigation">
              <NavItems />
              <AuthButtons />
            </nav>
          </SheetContent>
        </Sheet>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <AuthButtons />
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
} 