"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AuthButton } from "@/components/auth-button"
import { POST_MESSAGES } from "@/lib/constants/messages"

interface PostHeaderProps {
  postId?: string
}

export function PostHeader({ postId }: PostHeaderProps) {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/posts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {POST_MESSAGES.BACK_TO_BOARD}
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{POST_MESSAGES.POST_DETAIL}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Kubernetes Korea</p>
            </div>
          </div>
          <AuthButton />
        </div>
      </div>
    </header>
  )
}