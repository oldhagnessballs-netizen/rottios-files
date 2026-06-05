"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface Comment {
  id: number
  content: string
  userId: string
  createdAt: Date
  userName: string | null
}

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (content: string) => Promise<void>
  onDeleteComment: (id: number) => Promise<void>
  currentUserId?: string
  isAdmin?: boolean
}

export function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
  currentUserId,
  isAdmin,
}: CommentSectionProps) {
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    startTransition(async () => {
      await onAddComment(content.trim())
      setContent("")
    })
  }

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return
    startTransition(async () => {
      await onDeleteComment(id)
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your comment..."
              rows={3}
            />
            <Button type="submit" disabled={isPending || !content.trim()}>
              {isPending ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold">Comments ({comments.length})</h3>
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{comment.userName || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  {(currentUserId === comment.userId || isAdmin) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(comment.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
