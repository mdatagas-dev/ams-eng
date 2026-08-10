import { randomUUID } from "node:crypto"
import { RiArchiveLine, RiQrCodeLine } from "@remixicon/react"
import { notFound } from "next/navigation"

import { CabinetCheckoutForm } from "@/components/cabinet-checkout-form"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ApiRequestError, apiGet } from "@/lib/api"
import type { CabinetCheckoutData } from "@/lib/inventory-types"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

export default async function CabinetCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const t = getDictionary(await getLang())
  const { id } = await params
  let data: CabinetCheckoutData
  try {
    data = await apiGet<CabinetCheckoutData>(`/public/cabinets/${id}`)
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound()
    throw error
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <RiQrCodeLine />
            </div>
            <div>
              <p className="font-semibold">{t.checkoutTitle}</p>
              <p className="text-sm text-muted-foreground">
                {t.checkoutSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Badge variant="outline">{data.cabinet.code}</Badge>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>
              <h1>{t.checkoutFrom.replace("{name}", data.cabinet.name)}</h1>
            </CardTitle>
            <CardDescription>{t.checkoutDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {data.items.length ? (
              <CabinetCheckoutForm data={data} checkoutId={randomUUID()} />
            ) : (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <RiArchiveLine />
                  </EmptyMedia>
                  <EmptyTitle>{t.noItemsAvailable}</EmptyTitle>
                  <EmptyDescription>{t.noItemsDesc}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          {t.verifyCheckout}
        </p>
      </div>
    </main>
  )
}
