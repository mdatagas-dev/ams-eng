import { Router } from "express"

import { Prisma, UserRole } from "./generated/prisma/client.js"
import { requireAuth, SESSION_DURATION_MS } from "./auth.js"
import { prisma } from "./db.js"
import {
  ApiError,
  input,
  oneOf,
  secret,
  text,
  username,
  uuid,
} from "./input.js"
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from "./password.js"

export const authRoutes = Router()
export const userRoutes = Router()

const loginAttempts = new Map<string, { failures: number; resetAt: number }>()
// ponytail: per-process throttle; move to a shared store if the API scales horizontally.

authRoutes.post("/login", async (request, response) => {
  const body = input(request.body)
  const loginUsername = username(body)
  const password = secret(body, "password", 128)
  const key = loginUsername
  const attempt = loginAttempts.get(key)
  if (attempt && attempt.resetAt > Date.now() && attempt.failures >= 5) {
    throw new ApiError(429, "Too many login attempts; try again later")
  }

  const user = await prisma.user.findUnique({
    where: { username: loginUsername },
  })
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : (await hashPassword(password.padEnd(12, "\0")), false)

  if (!user || !user.active || !valid) {
    const current =
      attempt?.resetAt && attempt.resetAt > Date.now() ? attempt.failures : 0
    loginAttempts.set(key, {
      failures: current + 1,
      resetAt: Date.now() + 15 * 60 * 1000,
    })
    throw new ApiError(401, "Invalid username or password")
  }

  loginAttempts.delete(key)
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  await prisma.$transaction([
    prisma.session.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    }),
    prisma.session.create({
      data: { userId: user.id, tokenHash: hashSessionToken(token), expiresAt },
    }),
  ])

  response.json({
    token,
    expiresAt,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
  })
})

authRoutes.use(requireAuth)

authRoutes.get("/me", (request, response) => {
  const user = request.auth!
  response.json({
    id: user.userId,
    name: user.name,
    username: user.username,
    role: user.role,
  })
})

authRoutes.post("/logout", async (request, response) => {
  await prisma.session.deleteMany({ where: { id: request.auth!.sessionId } })
  response.status(204).end()
})

userRoutes.get("/", async (_request, response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      active: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  })
  response.json(users)
})

userRoutes.post("/", async (request, response) => {
  const body = input(request.body)
  const name = text(body, "name", 150)
  const userUsername = username(body)
  const password = secret(body, "password", 128)
  const role = oneOf(body, "role", Object.values(UserRole))

  let passwordHash: string
  try {
    passwordHash = await hashPassword(password)
  } catch (error) {
    throw new ApiError(
      400,
      error instanceof Error ? error.message : "Invalid password"
    )
  }

  const user = await prisma.user.create({
    data: { name, username: userUsername, passwordHash, role },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      active: true,
      createdAt: true,
    },
  })
  response.status(201).json(user)
})

userRoutes.patch("/:id/active", async (request, response) => {
  const id = uuid(request.params.id)
  const body = input(request.body)
  if (typeof body.active !== "boolean") {
    throw new ApiError(400, "active must be a boolean")
  }
  const active = body.active
  if (id === request.auth!.userId && active === false) {
    throw new ApiError(400, "You cannot deactivate your own account")
  }

  const user = await prisma.$transaction(
    async (transaction) => {
      const target = await transaction.user.findUnique({ where: { id } })
      if (!target) throw new ApiError(404, "User not found")

      if (!active && target.active && target.role === UserRole.SUPER_USER) {
        const activeSuperUsers = await transaction.user.count({
          where: { role: UserRole.SUPER_USER, active: true },
        })
        if (activeSuperUsers <= 1) {
          throw new ApiError(409, "At least one active super user is required")
        }
      }

      return transaction.user.update({
        where: { id },
        data: {
          active,
          sessions: active ? undefined : { deleteMany: {} },
        },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          active: true,
          createdAt: true,
        },
      })
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  )
  response.json(user)
})
