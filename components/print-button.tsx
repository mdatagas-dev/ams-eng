"use client"

import { RiPrinterLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"

export function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <RiPrinterLine data-icon="inline-start" />
      Print QR labels
    </Button>
  )
}
