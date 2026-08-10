"use server"

import { cookies } from "next/headers"

import { languages } from "@/lib/i18n"

export async function setLang(lang: string) {
  if (!(languages as readonly string[]).includes(lang)) return
  const cookieStore = await cookies()
  cookieStore.set("ams_lang", lang, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  })
}
