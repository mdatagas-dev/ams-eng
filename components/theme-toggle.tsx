"use client"

import { RiMoonClearLine, RiSunLine } from "@remixicon/react"

import { useTheme } from "@/components/theme-provider"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  const isDark = theme !== "light"
  const label = isDark ? t("switchLightTheme") : t("switchDarkTheme")

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <RiSunLine /> : <RiMoonClearLine />}
    </Button>
  )
}
