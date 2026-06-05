"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { adminDeleteFile, adminDeletePost } from "@/app/actions/admin"
import { Trash2 } from "lucide-react"

interface FileItem {
  id: number
  name: string
  url: string
  size: number
  type: string
  isPublic: boolean
  userId: string
  createdAt: Date
  userName?: string | null
}

interface PostItem {
  id: number
  title: string
  content: string
  userId: string
  createdAt: Date
  userName?: string | null
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function ContentModeration({
  files,
  posts,
}: {
  files: FileItem[]
  posts: PostItem[]
}) {
  const handleDeleteFile = async (fileId: number) => {
    if (!confirm("Delete this file?")) return
    await adminDeleteFile(fileId)
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Delete this post?")) return
    await adminDeletePost(postId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="files">
          <TabsList>
            <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {file.name}
                    </TableCell>
                    <TableCell>{file.userName || "Unknown"}</TableCell>
                    <TableCell>{formatBytes(file.size)}</TableCell>
                    <TableCell>
                      <Badge variant={file.isPublic ? "default" : "secondary"}>
                        {file.isPublic ? "Public" : "Private"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(file.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="posts" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {post.title}
                    </TableCell>
                    <TableCell>{post.userName || "Unknown"}</TableCell>
                    <TableCell>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
