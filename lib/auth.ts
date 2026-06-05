import { betterAuth } from "better-auth"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.V0_RUNTIME_URL || "http://localhost:3000"
}

const getTrustedOrigins = () => {
  const origins: string[] = []
  if (process.env.BETTER_AUTH_URL) origins.push(process.env.BETTER_AUTH_URL)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`)
  if (process.env.V0_RUNTIME_URL) origins.push(process.env.V0_RUNTIME_URL)
  return origins
}

const ADMIN_EMAIL = "eee77484@gmail.com"

export const auth = betterAuth({
  database: pool,
  baseURL: getBaseURL(),
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      banned: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Automatically set admin role for the designated admin email
          if (user.email === ADMIN_EMAIL) {
            await pool.query(
              'UPDATE "user" SET role = $1 WHERE id = $2',
              ["admin", user.id]
            )
          }
        },
      },
    },
  },
  advanced: {
    ...(process.env.NODE_ENV === "development" && {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      },
    }),
  },
})
