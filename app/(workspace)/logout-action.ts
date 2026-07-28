"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { apiSend, SESSION_COOKIE } from "@/lib/api"

export async function logout() {
  try {
    await apiSend<void>("/auth/logout", "POST", {})
  } catch {
    // Clearing the local cookie must not depend on API availability.
  } finally {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)
  }
  redirect("/login")
}
