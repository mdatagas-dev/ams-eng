import * as React from "react"

const MOBILE_BREAKPOINT = 768
const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(query)
  mediaQuery.addEventListener("change", onChange)
  return () => mediaQuery.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.matchMedia(query).matches
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}
