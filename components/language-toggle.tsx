"use client"

import { RiGlobalLine } from "@remixicon/react"

import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const { lang, setLanguage } = useI18n()
  const next = lang === "en" ? "id" : "en"
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="gap-1.5 font-medium"
      onClick={() => setLanguage(next)}
      aria-label={next.toUpperCase()}
    >
      <RiGlobalLine data-icon="inline-start" />
      {next.toUpperCase()}
    </Button>
  )
}
