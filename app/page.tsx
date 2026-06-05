import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getMyFiles, getPublicFiles } from "@/app/actions/files"
import { getPosts } from "@/app/actions/posts"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { FileCard } from "@/components/file-card"
import { PostCard } from "@/components/post-card"
import { UploadDialog } from "@/components/upload-dialog"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { UserMenu } from "@/components/user-menu"
import { AnnouncementBanner } from "@/components/announcement-banner"
import { FileIcon, MessageSquare, Globe } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect("/sign-in")
  }
  
  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
  
  if (userData?.banned) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-destructive mb-2">Account Banned</h1>
          <p className="text-muted-foreground">Your account has been banned. Please contact support.</p>
        </div>
      </main>
    )
  }
  
  const isAdmin = userData?.role === "admin"
  const myFiles = await getMyFiles()
  const publicFiles = await getPublicFiles()
  const posts = await getPosts()
  
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Rottio&apos;s Files
          </Link>
          <div className="flex items-center gap-4">
            <UploadDialog />
            <CreatePostDialog />
            <UserMenu
              user={{
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
              }}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <AnnouncementBanner />
        </div>
        
        <Tabs defaultValue="my-files" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="my-files" className="gap-2">
              <FileIcon className="h-4 w-4" />
              My Files
            </TabsTrigger>
            <TabsTrigger value="public-files" className="gap-2">
              <Globe className="h-4 w-4" />
              Public Files
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Posts
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-files">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">My Files</h2>
              <p className="text-muted-foreground">Files you have uploaded</p>
            </div>
            {myFiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files uploaded yet. Click &quot;Upload File&quot; to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    currentUserId={session.user.id}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="public-files">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Public Files</h2>
              <p className="text-muted-foreground">Files shared by the community</p>
            </div>
            {publicFiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No public files yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    currentUserId={session.user.id}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="posts">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Community Posts</h2>
              <p className="text-muted-foreground">Share and discuss with others</p>
            </div>
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No posts yet. Be the first to create one!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-w-2xl">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={session.user.id}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
