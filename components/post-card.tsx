"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deletePost } from "@/app/actions/posts"
import { Trash2, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"

interface PostCardProps {
  post: {
    id: number
    title: string
    content: string
    userId: string
    createdAt: Date
    userName: string | null
  }
  currentUserId?: string
  isAdmin?: boolean
}

export function PostCard({ post, currentUserId, isAdmin }: PostCardProps) {
  const [isPending, startTransition] = useTransition()
  const isOwner = currentUserId === post.userId
  const canDelete = isOwner || isAdmin

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this post?")) return
    startTransition(async () => {
      await deletePost(post.id)
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{post.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          By {post.userName || "Unknown"} on{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-3">{post.content}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/posts/${post.id}`}>
            <MessageSquare className="h-4 w-4 mr-1" />
            View & Comment
          </Link>
        </Button>
        {canDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
