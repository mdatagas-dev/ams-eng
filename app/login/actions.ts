"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { apiSend, SESSION_COOKIE } from "@/lib/api"
import type { AuthUser } from "@/lib/auth-types"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"
import type { LoginState } from "@/lib/login-state"

export async function login(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  const t = getDictionary(await getLang())
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  if (!username || !password) {
    return { error: t.loginRequired }
  }

  let result: { token: string; expiresAt: string; user: AuthUser }
  try {
    result = await apiSend("/auth/login", "POST", { username, password })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : t.unableToSignIn,
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure:
      process.env.COOKIE_SECURE === undefined
        ? process.env.NODE_ENV === "production"
        : process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    expires: new Date(result.expiresAt),
  })
  redirect("/")
}
