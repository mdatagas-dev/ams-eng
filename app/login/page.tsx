import { redirect } from "next/navigation"
import Image from "next/image"

import { LanguageToggle } from "@/components/language-toggle"
import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { getCurrentUser } from "@/lib/auth"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

export default async function LoginPage() {
  const t = getDictionary(await getLang())
  const user = await getCurrentUser()
  if (user) redirect("/")

  return (
    <main className="relative grid min-h-svh bg-background lg:grid-cols-[1fr_32rem]">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <section className="hidden border-r bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div>
          <Image
            src="/logo.png"
            alt=""
            width={64}
            height={64}
            className="size-16 rounded-xl object-cover"
          />
          <p className="mt-6 font-mono text-xs tracking-[0.18em] text-sidebar-foreground/60 uppercase">
            Engineering + IT
          </p>
          <h1 className="mt-6 max-w-xl text-5xl leading-tight font-semibold tracking-tight">
            {t.loginHeroTitle}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-sidebar-foreground/60">
          {t.loginHeroDescription}
        </p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <LoginForm />
      </section>
    </main>
  )
}
