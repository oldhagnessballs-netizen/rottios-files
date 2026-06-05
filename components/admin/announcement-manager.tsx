"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from "@/app/actions/admin"
import { Trash2, Eye, EyeOff, Plus } from "lucide-react"

interface Announcement {
  id: number
  title: string
  content: string
  isActive: boolean
  createdAt: Date
  userName?: string | null
}

export function AnnouncementManager({
  announcements,
}: {
  announcements: Announcement[]
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    try {
      await createAnnouncement(title, content)
      setTitle("")
      setContent("")
    } catch (error) {
      console.error("Failed to create announcement:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: number) => {
    await toggleAnnouncement(id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return
    await deleteAnnouncement(id)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                placeholder="Announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="announcement-content">Content</Label>
              <Textarea
                id="announcement-content"
                placeholder="Announcement content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Announcement"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {announcement.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={announcement.isActive ? "default" : "secondary"}
                    >
                      {announcement.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(announcement.id)}
                      >
                        {announcement.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
