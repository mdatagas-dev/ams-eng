import { connection } from "next/server"
import { redirect } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { ApiRequestError } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()
  let user
  try {
    user = await getCurrentUser()
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401)
      redirect("/login")
    throw error
  }
  return <AppShell user={user}>{children}</AppShell>
}
