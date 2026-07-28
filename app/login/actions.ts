"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { apiSend, SESSION_COOKIE } from "@/lib/api"
import type { AuthUser } from "@/lib/auth-types"
import type { LoginState } from "@/lib/login-state"

export async function login(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  let result: { token: string; expiresAt: string; user: AuthUser }
  try {
    result = await apiSend("/auth/login", "POST", { username, password })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to sign in",
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(result.expiresAt),
  })
  redirect("/")
}
