import { RiQrCodeLine } from "@remixicon/react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function CabinetCheckoutNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Empty className="w-full max-w-xl border bg-background">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RiQrCodeLine />
          </EmptyMedia>
          <EmptyTitle>Cabinet checkout unavailable</EmptyTitle>
          <EmptyDescription>
            This QR is invalid or the cabinet has been disabled. Contact an
            Engineering administrator.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  )
}
