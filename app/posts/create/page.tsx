"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { CREATE_POST_MESSAGES } from '@/lib/constants/messages'
import { CreatePostForm } from "@/components/post/CreatePostForm"
import Link from "next/link"


export default function CreatePostPage() {
  const { data: session, status } = useSession()


  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{CREATE_POST_MESSAGES.LOADING}</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{CREATE_POST_MESSAGES.LOGIN_REQUIRED_TITLE}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">{CREATE_POST_MESSAGES.LOGIN_REQUIRED_DESC}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">{CREATE_POST_MESSAGES.HOME_BUTTON}</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signin">{CREATE_POST_MESSAGES.LOGIN_BUTTON}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/posts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {CREATE_POST_MESSAGES.BACK_TO_BOARD}
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{CREATE_POST_MESSAGES.NEW_POST_TITLE}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">{CREATE_POST_MESSAGES.NEW_POST_DESC}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardContent>
              <CreatePostForm session={session} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
