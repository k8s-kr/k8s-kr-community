"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { POST_MESSAGES, ALERT_MESSAGES, CONSOLE_ERROR_MESSAGES } from "@/lib/constants/messages"

interface Post {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  author: {
    name: string
    image: string
    email: string
  }
  createdAt: string
  comments: Comment[]
  likes?: string[]
  pinned?: boolean
}

interface Comment {
  id: string
  content: string
  author: {
    name: string
    image: string
    email: string
  }
  createdAt: string
  replies?: Comment[]
  parentId?: string
}

export function usePostDetail() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    if (params.id === "create") {
      router.replace("/posts/create")
      return
    }
  }, [params.id, router])

  useEffect(() => {
    if (params.id === "create") return

    const posts = JSON.parse(localStorage.getItem("posts") || "[]")
    const foundPost = posts.find((p: Post) => p.id === params.id)
    if (foundPost) {
      setPost(foundPost)
    }
    console.log("[v0] Looking for post with ID:", params.id)
    console.log(
      "[v0] Available posts:",
      posts.map((p: Post) => ({ id: p.id, title: p.title })),
    )
    console.log("[v0] Found post:", foundPost)
  }, [params.id])

  const getAvailableUsers = () => {
    if (!post) return []

    const users = new Map()

    users.set(post.author.email, {
      name: post.author.name,
      email: post.author.email,
      image: post.author.image
    })

    post.comments.forEach(comment => {
      users.set(comment.author.email, {
        name: comment.author.name,
        email: comment.author.email,
        image: comment.author.image
      })

      if (comment.replies) {
        comment.replies.forEach(reply => {
          users.set(reply.author.email, {
            name: reply.author.name,
            email: reply.author.email,
            image: reply.author.image
          })
        })
      }
    })

    if (session?.user?.email) {
      users.delete(session.user.email)
    }

    return Array.from(users.values())
  }

  const renderMentions = (text: string) => {
    const mentionRegex = /@([\w가-힣]+)/g
    const parts = text.split(mentionRegex)

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const availableUsers = getAvailableUsers()
        const isValidUser = availableUsers.some(user => user.name === part)

        if (isValidUser) {
          return (
            <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
              @{part}
            </span>
          )
        } else {
          return `@${part}`
        }
      }
      return part
    })
  }

  const handleLikeToggle = async () => {
    if (!session || !post) return

    try {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: any) => {
        if (p.id === post.id) {
          const likes = p.likes || []
          const hasLiked = session.user?.email ? likes.includes(session.user.email) : false

          if (hasLiked) {
            return {
              ...p,
              likes: session.user?.email ? likes.filter((email: string) => email !== session.user.email) : likes
            }
          } else {
            return {
              ...p,
              likes: session.user?.email ? [...likes, session.user.email] : likes
            }
          }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      const likes = post.likes || []
      const hasLiked = session.user?.email ? likes.includes(session.user.email) : false

      if (hasLiked) {
        setPost({
          ...post,
          likes: session.user?.email ? likes.filter(email => email !== session.user.email) : likes
        })
      } else {
        setPost({
          ...post,
          likes: session.user?.email ? [...likes, session.user.email] : likes
        })
      }
    } catch (error) {
      console.error(CONSOLE_ERROR_MESSAGES.LIKE_FAILED, error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title,
          text: `${post?.title} - Kubernetes Korea`,
          url: url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        alert(ALERT_MESSAGES.URL_COPIED)
      }
    } catch (error) {
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert(ALERT_MESSAGES.URL_COPIED)
    }
  }

  const handleDeletePost = async () => {
    if (!post || !session) return

    const confirmed = window.confirm(ALERT_MESSAGES.CONFIRM_DELETE_POST)
    if (!confirmed) return

    try {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const filteredPosts = posts.filter((p: Post) => p.id !== post.id)
      localStorage.setItem("posts", JSON.stringify(filteredPosts))
      router.push("/posts")
    } catch (error) {
      console.error(CONSOLE_ERROR_MESSAGES.DELETE_POST_FAILED, error)
    }
  }

  const handlePinToggle = async () => {
    if (!post || !session) return

    const isAdmin = (session.user?.email === "admin@example.com") || (session.user?.name === "admin")
    if (!isAdmin) {
      alert(ALERT_MESSAGES.ADMIN_ONLY_PIN)
      return
    }

    try {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: any) => {
        if (p.id === post.id) {
          return {
            ...p,
            pinned: !p.pinned
          }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      setPost({
        ...post,
        pinned: !post.pinned
      })

      alert(post.pinned ? ALERT_MESSAGES.POST_UNPINNED : ALERT_MESSAGES.POST_PINNED)
    } catch (error) {
      console.error(CONSOLE_ERROR_MESSAGES.PIN_FAILED, error)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session || !post) return

    setIsSubmittingComment(true)

    try {
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: {
          name: session.user?.name || "",
          image: session.user?.image || "",
          email: session.user?.email || "",
        },
        createdAt: new Date().toISOString(),
        replies: [],
      }

      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: Post) => {
        if (p.id === post.id) {
          return { ...p, comments: [...p.comments, comment] }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))
      setPost({ ...post, comments: [...post.comments, comment] })
      setNewComment("")
    } catch (error) {
      console.error(CONSOLE_ERROR_MESSAGES.COMMENT_FAILED, error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleCommentEdit = (commentId: string, newContent: string, isReply?: boolean, parentId?: string) => {
    if (!newContent.trim() || !post) return

    try {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: Post) => {
        if (p.id === post.id) {
          if (isReply && parentId) {
            const updatedComments = p.comments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: comment.replies?.map((reply) =>
                    reply.id === commentId
                      ? { ...reply, content: newContent.trim(), updatedAt: new Date().toISOString() }
                      : reply
                  ) || []
                }
              }
              return comment
            })
            return { ...p, comments: updatedComments }
          } else {
            const updatedComments = p.comments.map((comment) =>
              comment.id === commentId
                ? { ...comment, content: newContent.trim(), updatedAt: new Date().toISOString() }
                : comment
            )
            return { ...p, comments: updatedComments }
          }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      if (isReply && parentId) {
        const updatedPost = {
          ...post,
          comments: post.comments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: comment.replies?.map((reply) =>
                  reply.id === commentId
                    ? { ...reply, content: newContent.trim(), updatedAt: new Date().toISOString() }
                    : reply
                ) || []
              }
            }
            return comment
          })
        }
        setPost(updatedPost)
      } else {
        const updatedPost = {
          ...post,
          comments: post.comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, content: newContent.trim(), updatedAt: new Date().toISOString() }
              : comment
          )
        }
        setPost(updatedPost)
      }
    } catch (error) {
      console.error(CONSOLE_ERROR_MESSAGES.COMMENT_UPDATE_FAILED, error)
    }
  }

  const handleCommentDelete = (commentId: string, isReply?: boolean, parentId?: string) => {
    const confirmed = window.confirm(ALERT_MESSAGES.CONFIRM_DELETE_COMMENT)
    if (!confirmed || !post) return

    try {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: Post) => {
        if (p.id === post.id) {
          if (isReply && parentId) {
            const updatedComments = p.comments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: comment.replies?.filter((reply) => reply.id !== commentId) || []
                }
              }
              return comment
            })
            return { ...p, comments: updatedComments }
          } else {
            const updatedComments = p.comments.filter((comment) => comment.id !== commentId)
            return { ...p, comments: updatedComments }
          }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      if (isReply && parentId) {
        const updatedPost = {
          ...post,
          comments: post.comments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: comment.replies?.filter((reply) => reply.id !== commentId) || []
              }
            }
            return comment
          })
        }
        setPost(updatedPost)
      } else {
        const updatedPost = {
          ...post,
          comments: post.comments.filter((comment) => comment.id !== commentId)
        }
        setPost(updatedPost)
      }
    } catch (error) {
      console.error(CONSOLE_ERROR_MESSAGES.COMMENT_DELETE_FAILED, error)
    }
  }

  const handleReplySubmit = (commentId: string, content: string) => {
    if (!content.trim() || !session || !post) return

    try {
      const reply: Comment = {
        id: Date.now().toString(),
        content: content.trim(),
        author: {
          name: session.user?.name || "",
          image: session.user?.image || "",
          email: session.user?.email || "",
        },
        createdAt: new Date().toISOString(),
        parentId: commentId,
      }

      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: Post) => {
        if (p.id === post.id) {
          const updatedComments = p.comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), reply],
              }
            }
            return comment
          })
          return { ...p, comments: updatedComments }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      const updatedPost = {
        ...post,
        comments: post.comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply],
            }
          }
          return comment
        })
      }

      setPost(updatedPost)
    } catch (error) {
      console.error(CONSOLE_ERROR_MESSAGES.REPLY_FAILED, error)
    }
  }

  return {
    post,
    session,
    params,
    newComment,
    setNewComment,
    isSubmittingComment,
    getAvailableUsers,
    renderMentions,
    handleLikeToggle,
    handleShare,
    handleDeletePost,
    handlePinToggle,
    handleCommentSubmit,
    handleCommentEdit,
    handleCommentDelete,
    handleReplySubmit
  }
}