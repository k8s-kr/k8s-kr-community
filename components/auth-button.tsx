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
import { useState, useEffect } from "react"

function useTemporarySession() {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("temp-user")
      if (stored) {
        setSession(JSON.parse(stored))
        setStatus("authenticated")
      } else {
        setStatus("unauthenticated")
      }
    }
  }, [])

  const signIn = () => {
    // 임시 사용자 데이터 생성
    const tempUser = {
      name: "개발자",
      email: "developer@example.com",
      image: "/developer-avatar.png",
    }
    localStorage.setItem("temp-user", JSON.stringify(tempUser))
    setSession(tempUser)
    setStatus("authenticated")
  }

  const signOut = () => {
    localStorage.removeItem("temp-user")
    setSession(null)
    setStatus("unauthenticated")
  }

  return { data: session, status, signIn, signOut }
}

export function AuthButton() {
  const { data: session, status, signIn, signOut } = useTemporarySession()

  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled>
        로딩중...
      </Button>
    )
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.image || ""} alt={session.name || ""} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{session.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>프로필</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>로그아웃</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={signIn}>
      <Github className="w-4 h-4 mr-2" />
      GitHub 로그인
    </Button>
  )
}
