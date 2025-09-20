"use client"

import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth-button"
import { Plus } from "lucide-react"
import { POSTS_PAGE_MESSAGES } from '@/lib/constants/messages'
import Link from "next/link"

interface PostsHeaderProps {
  session: any
}

export function PostsHeader({ session }: PostsHeaderProps) {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K8s</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kubernetes Korea</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{POSTS_PAGE_MESSAGES.BOARD_TITLE}</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/posts/create">
                  <Plus className="w-4 h-4 mr-2" />{POSTS_PAGE_MESSAGES.WRITE_POST}
                </Link>
              </Button>
            )}
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  )
}