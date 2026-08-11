"use client"

import { redirect } from "next/navigation"
import { RiDatabaseLine, RiRefreshLine } from "@remixicon/react"

import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function WorkspaceError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string; status?: number }
  unstable_retry: () => void
}) {
  const { t } = useI18n()
  const status = typeof error.status === "number" ? error.status : 0
  if (status === 401 || /\(401\)$/.test(error.message ?? "")) redirect("/login")
  return (
    <Empty className="min-h-[60vh] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiDatabaseLine />
        </EmptyMedia>
        <EmptyTitle>{t("errorTitle")}</EmptyTitle>
        <EmptyDescription>{t("errorDescription")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={unstable_retry}>
          <RiRefreshLine data-icon="inline-start" />
          {t("tryAgain")}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
