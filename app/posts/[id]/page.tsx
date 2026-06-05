import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getPostById, getPostComments, addPostComment, deletePost } from "@/app/actions/posts"
import { deleteComment } from "@/app/actions/files"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CommentSection } from "@/components/comment-section"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const post = await getPostById(parseInt(id))
  if (!post) notFound()

  const comments = await getPostComments(parseInt(id))

  const [userData] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
  const isAdmin = userData?.role === "admin"

  const handleAddComment = async (content: string) => {
    "use server"
    await addPostComment(parseInt(id), content)
  }

  const handleDeleteComment = async (commentId: number) => {
    "use server"
    await deleteComment(commentId)
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Posted by {post.userName || "Unknown"} on{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
        </CardContent>
      </Card>

      <CommentSection
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        currentUserId={session.user.id}
        isAdmin={isAdmin}
      />
    </div>
  )
}
