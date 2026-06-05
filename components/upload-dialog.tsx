"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { uploadFile } from "@/app/actions/files"
import { Upload } from "lucide-react"

export function UploadDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("isPublic", isPublic.toString())
      
      await uploadFile(formData)
      setOpen(false)
      setIsPublic(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a File</DialogTitle>
          <DialogDescription>
            Choose a file to upload. You can make it public or keep it private.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="public">Make this file public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
