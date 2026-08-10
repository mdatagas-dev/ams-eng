import { cookies } from "next/headers"

import type { Language } from "./i18n"

export async function getLang(): Promise<Language> {
  const cookieStore = await cookies()
  const value = cookieStore.get("ams_lang")?.value
  return value === "en" ? "en" : "id"
}
