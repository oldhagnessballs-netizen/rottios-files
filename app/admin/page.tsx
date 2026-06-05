import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserManagement } from "@/components/admin/user-management"
import { ContentModeration } from "@/components/admin/content-moderation"
import { AnnouncementManager } from "@/components/admin/announcement-manager"
import { getAllUsers, getAllFiles, getAllPosts, getAllComments, getAllAnnouncements } from "@/app/actions/admin"
import { ArrowLeft, Users, FileIcon, MessageSquare, Megaphone } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [userData] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))

  if (userData?.role !== "admin") redirect("/")

  const [users, files, posts, comments, announcements] = await Promise.all([
    getAllUsers(),
    getAllFiles(),
    getAllPosts(),
    getAllComments(),
    getAllAnnouncements(),
  ])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileIcon className="h-4 w-4" />
              Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{files.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{posts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{announcements.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement users={users} />
        </TabsContent>

        <TabsContent value="content">
          <ContentModeration files={files} posts={posts} comments={comments} />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementManager announcements={announcements} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
