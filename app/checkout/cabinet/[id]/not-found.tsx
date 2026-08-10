import { RiQrCodeLine } from "@remixicon/react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

export default async function CabinetCheckoutNotFound() {
  const t = getDictionary(await getLang())
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Empty className="w-full max-w-xl border bg-background">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RiQrCodeLine />
          </EmptyMedia>
          <EmptyTitle>{t.checkoutUnavailable}</EmptyTitle>
          <EmptyDescription>{t.checkoutUnavailableDesc}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  )
}
