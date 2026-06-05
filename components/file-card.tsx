"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteFile, toggleFileVisibility } from "@/app/actions/files"
import { Download, Trash2, Eye, EyeOff, FileIcon } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"

interface FileCardProps {
  file: {
    id: number
    name: string
    url: string
    size: number
    type: string
    isPublic: boolean
    userId: string
    createdAt: Date
    userName: string | null
  }
  currentUserId?: string
  isAdmin?: boolean
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileCard({ file, currentUserId, isAdmin }: FileCardProps) {
  const [isPending, startTransition] = useTransition()
  const isOwner = currentUserId === file.userId
  const canModify = isOwner || isAdmin

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this file?")) return
    startTransition(async () => {
      await deleteFile(file.id)
    })
  }

  const handleToggleVisibility = () => {
    startTransition(async () => {
      await toggleFileVisibility(file.id)
    })
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <CardTitle className="text-base truncate">{file.name}</CardTitle>
          </div>
          {file.isPublic && <Badge variant="secondary">Public</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Size: {formatFileSize(file.size)}</p>
          <p>Type: {file.type || "Unknown"}</p>
          <p>By: {file.userName || "Unknown"}</p>
          <p>Uploaded: {new Date(file.createdAt).toLocaleDateString()}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-2">
        <Button asChild size="sm" variant="outline">
          <a href={file.url} download={file.name}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/files/${file.id}`}>View</Link>
        </Button>
        {isOwner && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleVisibility}
            disabled={isPending}
          >
            {file.isPublic ? (
              <EyeOff className="h-4 w-4 mr-1" />
            ) : (
              <Eye className="h-4 w-4 mr-1" />
            )}
            {file.isPublic ? "Private" : "Public"}
          </Button>
        )}
        {canModify && (
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
