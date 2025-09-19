"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Github, LogOut, User } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export function AuthButton() {
  const { data: session, status } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled>
        로딩중...
      </Button>
    )
  }

  if (session?.user) {
    return (
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <Avatar className="h-10 w-10">
        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium leading-none">{session.user.name}</p>
        <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>프로필</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={() => signIn("github")}>
      <Github className="w-4 h-4 mr-2" />
      GitHub 로그인
    </Button>
  )
}
