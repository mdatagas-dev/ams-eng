import { redirect } from "next/navigation"

import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { ApiRequestError } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"

export default async function LoginPage() {
  let signedIn = false
  try {
    await getCurrentUser()
    signedIn = true
  } catch (error) {
    if (!(error instanceof ApiRequestError) || error.status !== 401) throw error
  }
  if (signedIn) redirect("/")

  return (
    <main className="relative grid min-h-svh bg-background lg:grid-cols-[1fr_32rem]">
      <div className="absolute top-3 right-3 z-10">
        <ThemeToggle />
      </div>
      <section className="hidden border-r bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-sidebar-foreground/60 uppercase">
            Engineering + IT
          </p>
          <h1 className="mt-6 max-w-xl text-5xl leading-tight font-semibold tracking-tight">
            Equipment accountability from workshop to return.
          </h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-sidebar-foreground/60">
          Condition, custody, and immutable asset history in one operating
          console.
        </p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <LoginForm />
      </section>
    </main>
  )
}
