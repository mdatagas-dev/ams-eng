"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { RiMoonClearLine, RiSunLine } from "@remixicon/react"

import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useI18n()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), []) // eslint-disable-line react-hooks/set-state-in-effect

  const isDark = !hydrated || resolvedTheme !== "light"
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
