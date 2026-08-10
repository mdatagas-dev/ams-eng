"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { useRouter } from "next/navigation"

import { setLang } from "@/app/actions/lang"
import { getDictionary, makeT, type Language, type MessageKey, type Translate } from "@/lib/i18n"

type I18nValue = {
  lang: Language
  t: Translate
  setLanguage: (lang: Language) => void
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({
  lang,
  children,
}: {
  lang: Language
  children: React.ReactNode
}) {
  const router = useRouter()
  const [current, setCurrent] = useState<Language>(lang)
  const t = makeT(getDictionary(current))

  const setLanguage = useCallback(
    (next: Language) => {
      setCurrent(next)
      void setLang(next).then(() => router.refresh())
    },
    [router]
  )

  return (
    <I18nContext.Provider value={{ lang: current, t, setLanguage }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used within I18nProvider")
  return context
}

export type { MessageKey }
