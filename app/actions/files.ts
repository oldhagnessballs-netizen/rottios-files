"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { files, comments, user } from "@/lib/db/schema"
import { and, desc, eq, or } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"

async function getUserSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

async function isAdmin(userId: string) {
  const [userData] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
  return userData?.role === "admin"
}

export async function uploadFile(formData: FormData) {
  const currentUser = await getUserSession()
  
  const file = formData.get("file") as File
  const isPublic = formData.get("isPublic") === "true"
  
  if (!file) throw new Error("No file provided")

  const blob = await put(file.name, file, {
    access: "public",
  })

  const [newFile] = await db
    .insert(files)
    .values({
      name: file.name,
      url: blob.url,
      size: file.size,
      type: file.type,
      isPublic,
      userId: currentUser.id,
    })
    .returning()

  revalidatePath("/")
  return newFile
}

export async function getMyFiles() {
  const currentUser = await getUserSession()
  
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
    .where(eq(files.userId, currentUser.id))
    .orderBy(desc(files.createdAt))
}

export async function getPublicFiles() {
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
    .where(eq(files.isPublic, true))
    .orderBy(desc(files.createdAt))
}

export async function getFileById(id: number) {
  const currentUser = await getUserSession()
  
  const [file] = await db
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
    .where(
      and(
        eq(files.id, id),
        or(eq(files.isPublic, true), eq(files.userId, currentUser.id))
      )
    )

  return file
}

export async function deleteFile(id: number) {
  const currentUser = await getUserSession()
  const admin = await isAdmin(currentUser.id)

  const [file] = await db
    .select()
    .from(files)
    .where(eq(files.id, id))

  if (!file) throw new Error("File not found")
  if (!admin && file.userId !== currentUser.id) {
    throw new Error("Unauthorized")
  }

  // Delete from Vercel Blob
  await del(file.url)

  // Delete associated comments
  await db.delete(comments).where(eq(comments.fileId, id))

  // Delete file record
  await db.delete(files).where(eq(files.id, id))

  revalidatePath("/")
  revalidatePath(`/files/${id}`)
}

export async function toggleFileVisibility(id: number) {
  const currentUser = await getUserSession()

  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.id, id), eq(files.userId, currentUser.id)))

  if (!file) throw new Error("File not found or unauthorized")

  await db
    .update(files)
    .set({ isPublic: !file.isPublic })
    .where(eq(files.id, id))

  revalidatePath("/")
  revalidatePath(`/files/${id}`)
}

export async function addFileComment(fileId: number, content: string) {
  const currentUser = await getUserSession()

  const [newComment] = await db
    .insert(comments)
    .values({
      content,
      userId: currentUser.id,
      fileId,
    })
    .returning()

  revalidatePath(`/files/${fileId}`)
  return newComment
}

export async function getFileComments(fileId: number) {
  return db
    .select({
      id: comments.id,
      content: comments.content,
      userId: comments.userId,
      createdAt: comments.createdAt,
      userName: user.name,
    })
    .from(comments)
    .leftJoin(user, eq(comments.userId, user.id))
    .where(eq(comments.fileId, fileId))
    .orderBy(desc(comments.createdAt))
}

export async function deleteComment(commentId: number) {
  const currentUser = await getUserSession()
  const admin = await isAdmin(currentUser.id)

  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))

  if (!comment) throw new Error("Comment not found")
  if (!admin && comment.userId !== currentUser.id) {
    throw new Error("Unauthorized")
  }

  await db.delete(comments).where(eq(comments.id, commentId))

  revalidatePath("/")
}
