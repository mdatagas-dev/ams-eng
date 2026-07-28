import "server-only"

import { cache } from "react"

import { apiGet } from "./api"
import type { AuthUser } from "./auth-types"

export const getCurrentUser = cache(() => apiGet<AuthUser>("/auth/me"))
