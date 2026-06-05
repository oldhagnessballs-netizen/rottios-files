import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getFileById, getFileComments, addFileComment, deleteComment } from "@/app/actions/files"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CommentSection } from "@/components/comment-section"
import { Download, ArrowLeft, FileIcon } from "lucide-react"
import Link from "next/link"

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default async function FileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const file = await getFileById(parseInt(id))
  if (!file) notFound()

  const comments = await getFileComments(parseInt(id))

  const [userData] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
  const isAdmin = userData?.role === "admin"

  const handleAddComment = async (content: string) => {
    "use server"
    await addFileComment(parseInt(id), content)
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
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-xl">{file.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Uploaded by {file.userName || "Unknown"} on{" "}
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {file.isPublic && <Badge>Public</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-muted-foreground">Size:</span>{" "}
              {formatFileSize(file.size)}
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>{" "}
              {file.type || "Unknown"}
            </div>
          </div>
          <Button asChild>
            <a href={file.url} download={file.name}>
              <Download className="mr-2 h-4 w-4" />
              Download File
            </a>
          </Button>
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
