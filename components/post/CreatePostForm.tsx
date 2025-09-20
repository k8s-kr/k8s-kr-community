"use client"

import { useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Send } from "lucide-react"
import { PLACEHOLDERS, ERROR_MESSAGES, CATEGORY_LABELS, CREATE_POST_MESSAGES } from '@/lib/constants/messages'
import Link from "next/link"

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface CreatePostFormProps {
  session: any
}

export function CreatePostForm({ session }: CreatePostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const quillRef = useRef<any>(null)

  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = () => {
      const file = input.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result as string
          const quillEditor = quillRef.current?.getEditor()
          if (quillEditor) {
            const range = quillEditor.getSelection(true)
            quillEditor.insertEmbed(range.index, 'image', base64)
            quillEditor.setSelection(range.index + 1)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  }), [])

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image', 'code-block'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !category) return

    setIsSubmitting(true)

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        author: {
          name: session.user?.name || '',
          image: session.user?.image || '',
          email: session.user?.email || '',
        },
        createdAt: new Date().toISOString(),
      }

      const existingPosts = JSON.parse(localStorage.getItem("posts") || "[]")
      const newPost = {
        ...postData,
        id: Date.now().toString(),
        comments: [],
      }
      existingPosts.unshift(newPost)
      localStorage.setItem("posts", JSON.stringify(existingPosts))

      router.push(`/posts/${newPost.id}`)
    } catch (error) {
      console.error(ERROR_MESSAGES.POST_CREATION_FAILED, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src={session.user?.image || "/placeholder.svg?height=40&width=40"}
          alt={session.user?.name || ""}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{session.user?.name}</p>
          <p className="text-sm text-gray-500">{CREATE_POST_MESSAGES.AUTHOR_SUFFIX}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">{CREATE_POST_MESSAGES.CATEGORY_LABEL}</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder={PLACEHOLDERS.SELECT_CATEGORY} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="question">{CATEGORY_LABELS.question}</SelectItem>
              <SelectItem value="tip">{CATEGORY_LABELS.tip}</SelectItem>
              <SelectItem value="discussion">{CATEGORY_LABELS.discussion}</SelectItem>
              <SelectItem value="news">{CATEGORY_LABELS.news}</SelectItem>
              <SelectItem value="tutorial">{CATEGORY_LABELS.tutorial}</SelectItem>
              <SelectItem value="showcase">{CATEGORY_LABELS.showcase}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">{CREATE_POST_MESSAGES.TITLE_LABEL}</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={PLACEHOLDERS.POST_TITLE}
            required
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">{CREATE_POST_MESSAGES.CONTENT_LABEL}</Label>
          <div className="relative mb-6">
            <ReactQuill
              value={content}
              onChange={setContent}
              modules={quillModules}
              formats={quillFormats}
              placeholder={PLACEHOLDERS.POST_CONTENT}
              style={{ height: '400px' }}
            />
          </div>
          <div className="mt-4 pt-2">
            <p className="text-sm text-gray-500 bg-white relative z-10">
              {CREATE_POST_MESSAGES.CONTENT_HELP}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">{CREATE_POST_MESSAGES.TAGS_LABEL}</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={PLACEHOLDERS.POST_TAGS}
          />
          <p className="text-sm text-gray-500">
            {CREATE_POST_MESSAGES.TAGS_HELP}
          </p>
        </div>

        {tags && (
          <div className="flex flex-wrap gap-2">
            {tags.split(",").map(
              (tag, index) =>
                tag.trim() && (
                  <Badge key={index} variant="secondary">
                    {tag.trim()}
                  </Badge>
                ),
            )}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={!title.trim() || !content.trim() || !category || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {CREATE_POST_MESSAGES.POSTING}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {CREATE_POST_MESSAGES.PUBLISH_POST}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/posts">{CREATE_POST_MESSAGES.CANCEL}</Link>
          </Button>
        </div>
      </form>
    </>
  )
}