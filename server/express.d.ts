import type { UserRole } from "./generated/prisma/client.js"

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sessionId: string
        userId: string
        name: string
        username: string
        role: UserRole
      }
    }
  }
}

export {}
