"use client"

import { useSyncExternalStore } from "react"
import { RiMoonLine, RiSunLine } from "@remixicon/react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

function subscribe() {
  return () => {}
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  const isDark = !hydrated || resolvedTheme !== "light"
  const label = isDark ? "Switch to light theme" : "Switch to dark theme"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-11 sm:size-8"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <RiSunLine /> : <RiMoonLine />}
    </Button>
  )
}
