import { getActiveAnnouncements } from "@/app/actions/admin"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Megaphone } from "lucide-react"

export async function AnnouncementBanner() {
  const announcements = await getActiveAnnouncements()
  
  if (announcements.length === 0) return null
  
  return (
    <div className="flex flex-col gap-2">
      {announcements.map((announcement) => (
        <Alert key={announcement.id} className="border-primary/50 bg-primary/5">
          <Megaphone className="h-4 w-4" />
          <AlertTitle>{announcement.title}</AlertTitle>
          <AlertDescription>{announcement.content}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
