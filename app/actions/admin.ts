"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user, files, posts, comments, announcements } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { del } from "@vercel/blob"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  
  const [userData] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
  
  if (userData?.role !== "admin") throw new Error("Admin access required")
  return session.user
}

export async function getAllUsers() {
  await requireAdmin()
  
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
}

export async function banUser(userId: string) {
  await requireAdmin()
  
  await db
    .update(user)
    .set({ banned: true })
    .where(eq(user.id, userId))
  
  revalidatePath("/admin")
}

export async function unbanUser(userId: string) {
  await requireAdmin()
  
  await db
    .update(user)
    .set({ banned: false })
    .where(eq(user.id, userId))
  
  revalidatePath("/admin")
}

export async function adminDeleteFile(fileId: number) {
  await requireAdmin()
  
  const [file] = await db
    .select()
    .from(files)
    .where(eq(files.id, fileId))
  
  if (!file) throw new Error("File not found")
  
  await del(file.url)
  await db.delete(comments).where(eq(comments.fileId, fileId))
  await db.delete(files).where(eq(files.id, fileId))
  
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function adminDeletePost(postId: number) {
  await requireAdmin()
  
  await db.delete(comments).where(eq(comments.postId, postId))
  await db.delete(posts).where(eq(posts.id, postId))
  
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function adminDeleteComment(commentId: number) {
  await requireAdmin()
  
  await db.delete(comments).where(eq(comments.id, commentId))
  
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function getAllFiles() {
  await requireAdmin()
  
  return db
    .select({
      id: files.id,
      name: files.name,
      url: files.url,
      size: files.size,
      type: files.type,
      isPublic: files.isPublic,
      userId: files.userId,
      createdAt: files.createdAt,
      userName: user.name,
    })
    .from(files)
    .leftJoin(user, eq(files.userId, user.id))
    .orderBy(desc(files.createdAt))
}

export async function getAllPosts() {
  await requireAdmin()
  
  return db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      userId: posts.userId,
      createdAt: posts.createdAt,
      userName: user.name,
    })
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .orderBy(desc(posts.createdAt))
}

export async function getAllComments() {
  await requireAdmin()
  
  return db
    .select({
      id: comments.id,
      content: comments.content,
      userId: comments.userId,
      postId: comments.postId,
      fileId: comments.fileId,
      createdAt: comments.createdAt,
      userName: user.name,
    })
    .from(comments)
    .leftJoin(user, eq(comments.userId, user.id))
    .orderBy(desc(comments.createdAt))
}

// Announcements
export async function createAnnouncement(title: string, content: string) {
  const adminUser = await requireAdmin()
  
  const [newAnnouncement] = await db
    .insert(announcements)
    .values({
      title,
      content,
      userId: adminUser.id,
    })
    .returning()
  
  revalidatePath("/admin")
  revalidatePath("/")
  return newAnnouncement
}

export async function getActiveAnnouncements() {
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.isActive, true))
    .orderBy(desc(announcements.createdAt))
}

export async function getAllAnnouncements() {
  await requireAdmin()
  
  return db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.createdAt))
}

export async function toggleAnnouncement(id: number) {
  await requireAdmin()
  
  const [announcement] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id))
  
  if (!announcement) throw new Error("Announcement not found")
  
  await db
    .update(announcements)
    .set({ isActive: !announcement.isActive })
    .where(eq(announcements.id, id))
  
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function deleteAnnouncement(id: number) {
  await requireAdmin()
  
  await db.delete(announcements).where(eq(announcements.id, id))
  
  revalidatePath("/admin")
  revalidatePath("/")
}
