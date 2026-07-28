import type { NextFunction, Request, Response } from "express"

import { UserRole } from "./generated/prisma/client.js"
import { prisma } from "./db.js"
import { hashSessionToken } from "./password.js"

export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorization = request.get("authorization")
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : undefined

  if (!token) {
    response.status(401).json({ error: "Authentication required" })
    return
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  })

  if (!session || session.expiresAt <= new Date() || !session.user.active) {
    if (session) await prisma.session.deleteMany({ where: { id: session.id } })
    response.status(401).json({ error: "Session is invalid or expired" })
    return
  }

  request.auth = {
    sessionId: session.id,
    userId: session.user.id,
    name: session.user.name,
    username: session.user.username,
    role: session.user.role,
  }
  next()
}

export function requireRole(role: UserRole) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (request.auth?.role !== role) {
      response.status(403).json({ error: "Insufficient permissions" })
      return
    }
    next()
  }
}
