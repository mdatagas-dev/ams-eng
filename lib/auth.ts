import "server-only"

import { cache } from "react"

import { ApiRequestError, apiGet } from "./api"
import type { AuthUser } from "./auth-types"

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    return await apiGet<AuthUser>("/auth/me", { throwOn401: true })
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) return null
    throw error
  }
})
