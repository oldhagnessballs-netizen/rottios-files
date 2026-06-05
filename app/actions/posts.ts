"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { posts, comments, user } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

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

export async function createPost(title: string, content: string) {
  const currentUser = await getUserSession()

  const [newPost] = await db
    .insert(posts)
    .values({
      title,
      content,
      userId: currentUser.id,
    })
    .returning()

  revalidatePath("/")
  return newPost
}

export async function getPosts() {
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

export async function getPostById(id: number) {
  const [post] = await db
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
    .where(eq(posts.id, id))

  return post
}

export async function deletePost(id: number) {
  const currentUser = await getUserSession()
  const admin = await isAdmin(currentUser.id)

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))

  if (!post) throw new Error("Post not found")
  if (!admin && post.userId !== currentUser.id) {
    throw new Error("Unauthorized")
  }

  // Delete associated comments
  await db.delete(comments).where(eq(comments.postId, id))

  // Delete post
  await db.delete(posts).where(eq(posts.id, id))

  revalidatePath("/")
  revalidatePath(`/posts/${id}`)
}

export async function addPostComment(postId: number, content: string) {
  const currentUser = await getUserSession()

  const [newComment] = await db
    .insert(comments)
    .values({
      content,
      userId: currentUser.id,
      postId,
    })
    .returning()

  revalidatePath(`/posts/${postId}`)
  return newComment
}

export async function getPostComments(postId: number) {
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
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt))
}
