"use client"

import Link from "next/link"
import { ModeToggle } from "./mode-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Menu, User } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface UserProfile {
  email?: string;
  picture?: string;
  sub?: string;
  nickname?: string;
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
      <Button variant="ghost" asChild>
        <Link href="/" className="font-bold">
          Home
        </Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link href="/blog">
          Blog
        </Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link href="/gallery">
          Gallery
        </Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link href="/pravidla-ucasti">
          Pravidla účasti
        </Link>
      </Button>
    </>
  )

  const ProfileMenu = () => {
    if (loading) return null;

    if (!user) {
      return (
        <div className="flex items-center gap-2">
          <Button asChild>
            <a href="/auth/login">Sign in</a>
          </Button>
          <ModeToggle />
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage src={user.picture} alt={user.nickname || 'User avatar'} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.nickname}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
              <ModeToggle />
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/auth/logout" className="text-red-600 dark:text-red-400">
              Sign out
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-2">
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
              <Separator />
              <div className="md:hidden">
                <ProfileMenu />
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  )
} 